'use strict'

/* eslint-disable max-lines, import/max-dependencies */
require('../utils/polyfills')

const { getCommands } = require('../commands/get')
const { runCommands } = require('../commands/run_commands')
const { handleBuildError } = require('../error/handle')
const { getErrorInfo } = require('../error/info')
const { startErrorMonitor } = require('../error/monitor/start')
const { getBufferLogs } = require('../log/logger')
const { logBuildStart, logTimer, logBuildSuccess } = require('../log/messages/core')
const { loadPlugins } = require('../plugins/load')
const { getPluginsOptions } = require('../plugins/options')
const { pinPlugins } = require('../plugins/pinned_version')
const { startPlugins, stopPlugins } = require('../plugins/spawn')
const { addCorePlugins } = require('../plugins_core/add')
const { reportStatuses } = require('../status/report')
const { trackBuildComplete } = require('../telemetry/main')
const { initTimers, measureDuration } = require('../time/main')
const { reportTimers } = require('../time/report')

const { loadConfig } = require('./config')
const { getConstants } = require('./constants')
const { doDryRun } = require('./dry')
const { warnOnLingeringProcesses } = require('./lingering')
const { normalizeFlags } = require('./normalize_flags')
const { getSeverity } = require('./severity')

/**
 * Main entry point of Netlify Build.
 * Runs a builds and returns whether it succeeded or not.
 *
 * @param  {object} [flags] - build configuration CLI flags
 * @param  {string} [flags.config] - Path to the configuration file
 * @param  {string} [flags.cwd] - Current directory. Used to retrieve the configuration file
 * @param  {string} [flags.repositoryRoot] - Git repository root directory. Used to retrieve the configuration file.
 * @param  {string} [flags.apiHost] - Netlify API endpoint
 * @param  {string} [flags.token] - Netlify API token for authentication
 * @param  {string} [flags.siteId] - Netlify Site ID
 * @param  {string} [flags.deployId] - Netlify Deploy ID
 * @param  {string} [flags.context] - Build context
 * @param  {string} [flags.branch] - Repository branch
 * @param  {boolean} [flags.dry=false] - Run in dry mode, i.e. printing commands without executing them
 * @param  {string} [flags.nodePath] - Path to the Node.js binary to use in user commands and build plugins
 * @param  {boolean} [flags.buffer=false] - Buffer output instead of printing it
 *
 * @returns {object} buildResult
 * @returns {boolean} buildResult.success - Whether build succeeded or failed
 * @returns {number} buildResult.severityCode - Build success/failure status among:
 * 0 (success), 1 (build cancelled), 2 (user error), 3 (plugin error), 4 (system error). Can be used as exit code.
 * @returns {string[]} buildResult.logs - When using the `buffer` option, all log messages
 */
const build = async function (flags = {}) {
  const { errorMonitor, framework, mode, logs, debug, testOpts, statsdOpts, dry, telemetry, ...flagsA } =
    startBuild(flags)
  const errorParams = { errorMonitor, mode, logs, debug, testOpts }

  try {
    const { pluginsOptions, siteInfo, userNodeVersion, commandsCount, timers, durationNs } = await execBuild({
      ...flagsA,
      dry,
      errorMonitor,
      mode,
      logs,
      debug,
      testOpts,
      errorParams,
    })
    await handleBuildSuccess({
      framework,
      dry,
      logs,
      timers,
      durationNs,
      statsdOpts,
    })
    const { success, severityCode, status } = getSeverity('success')
    await telemetryReport({
      status,
      commandsCount,
      pluginsOptions,
      durationNs,
      siteInfo,
      telemetry,
      userNodeVersion,
      testOpts,
      errorParams,
    })
    return { success, severityCode, logs }
  } catch (error) {
    const { severity } = await handleBuildError(error, errorParams)
    const { pluginsOptions, siteInfo, userNodeVersion } = errorParams
    const { success, severityCode, status } = getSeverity(severity)
    await telemetryReport({ status, pluginsOptions, siteInfo, telemetry, userNodeVersion, testOpts, errorParams })
    return { success, severityCode, logs }
  }
}

// Performed on build start. Must be kept small and unlikely to fail since it
// does not have proper error handling. Error handling relies on `errorMonitor`
// being built, which relies itself on flags being normalized.
const startBuild = function (flags) {
  const timers = initTimers()

  const logs = getBufferLogs(flags)
  logBuildStart(logs)

  const { bugsnagKey, ...flagsA } = normalizeFlags(flags, logs)
  const errorMonitor = startErrorMonitor({ flags: flagsA, logs, bugsnagKey })

  return { ...flagsA, errorMonitor, logs, timers }
}

const tExecBuild = async function ({
  config,
  defaultConfig,
  cachedConfig,
  cwd,
  repositoryRoot,
  apiHost,
  token,
  siteId,
  context,
  branch,
  baseRelDir,
  env: envOpt,
  debug,
  nodePath,
  functionsDistDir,
  cacheDir,
  dry,
  mode,
  offline,
  deployId,
  testOpts,
  featureFlags,
  errorMonitor,
  errorParams,
  logs,
  timers,
  buildbotServerSocket,
  sendStatus,
}) {
  const {
    netlifyConfig,
    configPath,
    buildDir,
    packageJson,
    userNodeVersion,
    childEnv,
    token: tokenA,
    api,
    siteInfo,
    timers: timersA,
  } = await loadConfig({
    config,
    defaultConfig,
    cachedConfig,
    cwd,
    repositoryRoot,
    apiHost,
    token,
    siteId,
    context,
    branch,
    baseRelDir,
    envOpt,
    debug,
    mode,
    offline,
    deployId,
    logs,
    testOpts,
    nodePath,
    timers,
  })
  const constants = getConstants({
    configPath,
    buildDir,
    functionsDistDir,
    cacheDir,
    netlifyConfig,
    siteInfo,
    apiHost,
    token: tokenA,
    mode,
    testOpts,
  })
  const pluginsOptions = addCorePlugins({ netlifyConfig, constants })
  // `errorParams` is purposely stateful
  // eslint-disable-next-line fp/no-mutating-assign
  Object.assign(errorParams, { netlifyConfig, pluginsOptions, siteInfo, childEnv, userNodeVersion })

  const {
    pluginsOptions: pluginsOptionsA,
    commandsCount,
    timers: timersB,
  } = await runAndReportBuild({
    pluginsOptions,
    netlifyConfig,
    siteInfo,
    configPath,
    buildDir,
    nodePath,
    packageJson,
    userNodeVersion,
    childEnv,
    dry,
    mode,
    api,
    errorMonitor,
    deployId,
    errorParams,
    logs,
    debug,
    timers: timersA,
    sendStatus,
    testOpts,
    featureFlags,
    buildbotServerSocket,
    constants,
  })
  return { pluginsOptions: pluginsOptionsA, siteInfo, userNodeVersion, commandsCount, timers: timersB }
}

const execBuild = measureDuration(tExecBuild, 'total', { parentTag: 'build_site' })

// Runs a build then report any plugin statuses
const runAndReportBuild = async function ({
  pluginsOptions,
  netlifyConfig,
  siteInfo,
  configPath,
  buildDir,
  nodePath,
  packageJson,
  userNodeVersion,
  childEnv,
  buildbotServerSocket,
  constants,
  dry,
  mode,
  api,
  errorMonitor,
  deployId,
  errorParams,
  logs,
  debug,
  timers,
  sendStatus,
  testOpts,
  featureFlags,
}) {
  try {
    const {
      commandsCount,
      statuses,
      pluginsOptions: pluginsOptionsA,
      failedPlugins,
      timers: timersA,
    } = await initAndRunBuild({
      pluginsOptions,
      netlifyConfig,
      siteInfo,
      configPath,
      buildDir,
      nodePath,
      packageJson,
      userNodeVersion,
      childEnv,
      dry,
      mode,
      api,
      errorMonitor,
      deployId,
      errorParams,
      logs,
      debug,
      timers,
      sendStatus,
      testOpts,
      featureFlags,
      buildbotServerSocket,
      constants,
    })
    await Promise.all([
      reportStatuses({
        statuses,
        childEnv,
        api,
        mode,
        pluginsOptions: pluginsOptionsA,
        netlifyConfig,
        errorMonitor,
        deployId,
        logs,
        debug,
        sendStatus,
        testOpts,
      }),
      pinPlugins({
        pluginsOptions: pluginsOptionsA,
        failedPlugins,
        api,
        siteInfo,
        childEnv,
        mode,
        netlifyConfig,
        errorMonitor,
        logs,
        debug,
        testOpts,
        sendStatus,
      }),
    ])

    return { pluginsOptions: pluginsOptionsA, commandsCount, timers: timersA }
  } catch (error) {
    const [{ statuses }] = getErrorInfo(error)
    await reportStatuses({
      statuses,
      childEnv,
      api,
      mode,
      pluginsOptions,
      netlifyConfig,
      errorMonitor,
      deployId,
      logs,
      debug,
      sendStatus,
      testOpts,
    })
    throw error
  }
}

// Initialize plugin processes then runs a build
const initAndRunBuild = async function ({
  pluginsOptions,
  netlifyConfig,
  siteInfo,
  configPath,
  buildDir,
  nodePath,
  packageJson,
  userNodeVersion,
  childEnv,
  dry,
  mode,
  api,
  errorMonitor,
  deployId,
  errorParams,
  logs,
  debug,
  sendStatus,
  timers,
  testOpts,
  featureFlags,
  buildbotServerSocket,
  constants,
}) {
  const { pluginsOptions: pluginsOptionsA, timers: timersA } = await getPluginsOptions({
    pluginsOptions,
    netlifyConfig,
    siteInfo,
    buildDir,
    nodePath,
    packageJson,
    userNodeVersion,
    mode,
    api,
    logs,
    debug,
    sendStatus,
    timers,
    testOpts,
  })
  // eslint-disable-next-line fp/no-mutation, no-param-reassign
  errorParams.pluginsOptions = pluginsOptionsA

  const { childProcesses, timers: timersB } = await startPlugins({
    pluginsOptions: pluginsOptionsA,
    buildDir,
    childEnv,
    logs,
    debug,
    timers: timersA,
  })

  try {
    const {
      commandsCount,
      statuses,
      failedPlugins,
      timers: timersC,
    } = await runBuild({
      childProcesses,
      pluginsOptions: pluginsOptionsA,
      netlifyConfig,
      packageJson,
      configPath,
      buildDir,
      nodePath,
      childEnv,
      dry,
      featureFlags,
      buildbotServerSocket,
      constants,
      mode,
      api,
      errorMonitor,
      deployId,
      logs,
      debug,
      timers: timersB,
      testOpts,
    })

    await warnOnLingeringProcesses({ mode, logs, testOpts })

    return { commandsCount, statuses, pluginsOptions: pluginsOptionsA, failedPlugins, timers: timersC }
  } finally {
    stopPlugins(childProcesses)
  }
}

// Load plugin main files, retrieve their event handlers then runs them,
// together with the build command
const runBuild = async function ({
  childProcesses,
  pluginsOptions,
  netlifyConfig,
  packageJson,
  configPath,
  buildDir,
  nodePath,
  childEnv,
  dry,
  featureFlags,
  buildbotServerSocket,
  constants,
  mode,
  api,
  errorMonitor,
  deployId,
  logs,
  debug,
  timers,
  testOpts,
}) {
  const { pluginsCommands, timers: timersA } = await loadPlugins({
    pluginsOptions,
    childProcesses,
    netlifyConfig,
    packageJson,
    timers,
    debug,
  })

  const { commands, events } = getCommands({ pluginsCommands, netlifyConfig })

  if (dry) {
    doDryRun({ commands, constants, featureFlags, buildbotServerSocket, logs })
    return {}
  }

  const {
    commandsCount,
    statuses,
    failedPlugins,
    timers: timersB,
  } = await runCommands({
    commands,
    featureFlags,
    buildbotServerSocket,
    events,
    configPath,
    buildDir,
    nodePath,
    childEnv,
    constants,
    mode,
    api,
    errorMonitor,
    deployId,
    netlifyConfig,
    logs,
    debug,
    timers: timersA,
    testOpts,
  })
  return { commandsCount, statuses, failedPlugins, timers: timersB }
}

// Logs and reports that a build successfully ended
const handleBuildSuccess = async function ({ framework, dry, logs, timers, durationNs, statsdOpts }) {
  if (dry) {
    return
  }

  logBuildSuccess(logs)

  logTimer(logs, durationNs, 'Netlify Build')
  await reportTimers({ timers, statsdOpts, framework })
}

// Handles the calls and errors of telemetry reports
const telemetryReport = async function ({
  status,
  commandsCount,
  pluginsOptions,
  durationNs,
  siteInfo,
  telemetry,
  userNodeVersion,
  testOpts,
  errorParams,
}) {
  try {
    await trackBuildComplete({
      status,
      commandsCount,
      pluginsOptions,
      durationNs,
      siteInfo,
      telemetry,
      userNodeVersion,
      testOpts,
    })
  } catch (error) {
    await handleBuildError(error, errorParams)
  }
}

module.exports = build
/* eslint-enable max-lines, import/max-dependencies */
