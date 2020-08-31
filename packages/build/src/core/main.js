require('../utils/polyfills')

const { getCommands } = require('../commands/get')
const { runCommands } = require('../commands/run')
const { handleBuildError } = require('../error/handle')
const { getErrorInfo } = require('../error/info')
const { startErrorMonitor } = require('../error/monitor/start')
const { getBufferLogs } = require('../log/logger')
const { logBuildStart, logTimer, logBuildSuccess } = require('../log/main')
const { loadPlugins } = require('../plugins/load')
const { getPluginsOptions } = require('../plugins/options')
const { startPlugins, stopPlugins } = require('../plugins/spawn')
const { reportStatuses } = require('../status/report')
const { trackBuildComplete } = require('../telemetry/complete')
const { initTimers, measureDuration } = require('../time/main')
const { reportTimers } = require('../time/report')

const { loadConfig } = require('./config')
const { getConstants } = require('./constants')
const { doDryRun } = require('./dry')
const { normalizeFlags } = require('./flags')

/**
 * Main entry point of Netlify Build.
 * Runs a builds and returns whether it succeeded or not.
 *
 * @param  {object} [flags] - build configuration CLI flags
 * @param  {string} [flags.config] - Path to the configuration file
 * @param  {string} [flags.cwd] - Current directory. Used to retrieve the configuration file
 * @param  {string} [flags.repositoryRoot] - Git repository root directory. Used to retrieve the configuration file.
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
 * @returns {string[]} buildResult.logs - When using the `buffer` option, all log messages
 */
const build = async function(flags = {}) {
  const { errorMonitor, framework, mode, logs, debug, testOpts, statsdOpts, dry, telemetry, ...flagsA } = startBuild(
    flags,
  )
  const errorParams = { errorMonitor, mode, logs, debug, testOpts }

  try {
    const { netlifyConfig, siteInfo, commandsCount, timers, durationNs } = await execBuild({
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
      commandsCount,
      netlifyConfig,
      framework,
      dry,
      siteInfo,
      telemetry,
      mode,
      logs,
      timers,
      durationNs,
      testOpts,
      statsdOpts,
    })
    return { success: true, logs }
  } catch (error) {
    await handleBuildError(error, errorParams)
    return { success: false, logs }
  }
}

// Performed on build start. Must be kept small and unlikely to fail since it
// does not have proper error handling. Error handling relies on `errorMonitor`
// being built, which relies itself on flags being normalized.
const startBuild = function(flags) {
  const timers = initTimers()

  const logs = getBufferLogs(flags)
  logBuildStart(logs)

  const { bugsnagKey, ...flagsA } = normalizeFlags(flags, logs)
  const errorMonitor = startErrorMonitor({ flags: flagsA, logs, bugsnagKey })

  return { ...flagsA, errorMonitor, logs, timers }
}

const tExecBuild = async function({
  config,
  defaultConfig,
  cachedConfig,
  cwd,
  repositoryRoot,
  token,
  siteId,
  context,
  branch,
  baseRelDir,
  env: envOpt,
  debug,
  nodePath,
  functionsDistDir,
  buildImagePluginsDir,
  dry,
  mode,
  deployId,
  testOpts,
  errorMonitor,
  errorParams,
  logs,
  timers,
  sendStatus,
}) {
  const {
    netlifyConfig,
    configPath,
    buildDir,
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
    token,
    siteId,
    context,
    branch,
    baseRelDir,
    envOpt,
    debug,
    mode,
    deployId,
    logs,
    testOpts,
    timers,
  })
  // `errorParams` is purposely stateful
  // eslint-disable-next-line fp/no-mutating-assign
  Object.assign(errorParams, { netlifyConfig, childEnv })

  const { commandsCount, timers: timersB } = await runAndReportBuild({
    netlifyConfig,
    configPath,
    buildDir,
    nodePath,
    childEnv,
    functionsDistDir,
    buildImagePluginsDir,
    dry,
    siteInfo,
    mode,
    token: tokenA,
    api,
    errorMonitor,
    deployId,
    logs,
    debug,
    timers: timersA,
    sendStatus,
    testOpts,
  })
  return { netlifyConfig, siteInfo, commandsCount, timers: timersB }
}

const execBuild = measureDuration(tExecBuild, 'total', { parentTag: 'build_site' })

// Runs a build then report any plugin statuses
const runAndReportBuild = async function({
  netlifyConfig,
  configPath,
  buildDir,
  nodePath,
  childEnv,
  functionsDistDir,
  buildImagePluginsDir,
  dry,
  siteInfo,
  mode,
  token,
  api,
  errorMonitor,
  deployId,
  logs,
  debug,
  timers,
  sendStatus,
  testOpts,
}) {
  try {
    const { commandsCount, statuses, timers: timersA } = await initAndRunBuild({
      netlifyConfig,
      configPath,
      buildDir,
      nodePath,
      childEnv,
      functionsDistDir,
      buildImagePluginsDir,
      dry,
      siteInfo,
      mode,
      token,
      api,
      errorMonitor,
      deployId,
      logs,
      debug,
      timers,
      testOpts,
    })
    await reportStatuses({
      statuses,
      childEnv,
      api,
      mode,
      netlifyConfig,
      errorMonitor,
      deployId,
      logs,
      debug,
      sendStatus,
      testOpts,
    })

    return { commandsCount, timers: timersA }
  } catch (error) {
    const { statuses } = getErrorInfo(error)
    await reportStatuses({
      statuses,
      childEnv,
      api,
      mode,
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
const initAndRunBuild = async function({
  netlifyConfig,
  configPath,
  buildDir,
  nodePath,
  childEnv,
  functionsDistDir,
  buildImagePluginsDir,
  dry,
  siteInfo,
  mode,
  token,
  api,
  errorMonitor,
  deployId,
  logs,
  debug,
  timers,
  testOpts,
}) {
  const constants = await getConstants({ configPath, buildDir, functionsDistDir, netlifyConfig, siteInfo, token, mode })

  const { pluginsOptions, timers: timersA } = await getPluginsOptions({
    netlifyConfig,
    buildDir,
    constants,
    mode,
    buildImagePluginsDir,
    logs,
    debug,
    timers,
  })

  const { childProcesses, timers: timersB } = await startPlugins({
    pluginsOptions,
    buildDir,
    nodePath,
    childEnv,
    mode,
    logs,
    timers: timersA,
  })

  try {
    return await runBuild({
      childProcesses,
      pluginsOptions,
      netlifyConfig,
      configPath,
      buildDir,
      nodePath,
      childEnv,
      dry,
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
  } finally {
    await stopPlugins(childProcesses)
  }
}

// Load plugin main files, retrieve their event handlers then runs them,
// together with the build command
const runBuild = async function({
  childProcesses,
  pluginsOptions,
  netlifyConfig,
  configPath,
  buildDir,
  nodePath,
  childEnv,
  dry,
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
    constants,
    timers,
    debug,
  })

  const { commands, commandsCount } = getCommands(pluginsCommands, netlifyConfig)

  if (dry) {
    doDryRun({ commands, commandsCount, logs })
    return {}
  }

  const { commandsCount: commandsCountA, statuses, timers: timersB } = await runCommands({
    commands,
    configPath,
    buildDir,
    nodePath,
    childEnv,
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
  return { commandsCount: commandsCountA, statuses, timers: timersB }
}

// Logs and reports that a build successfully ended
const handleBuildSuccess = async function({
  commandsCount,
  netlifyConfig,
  framework,
  dry,
  siteInfo,
  telemetry,
  mode,
  logs,
  timers,
  durationNs,
  testOpts,
  statsdOpts,
}) {
  if (dry) {
    return
  }

  logBuildSuccess(logs)

  logTimer(logs, durationNs, 'Netlify Build')
  await reportTimers({ timers, statsdOpts, framework })
  await trackBuildComplete({ commandsCount, netlifyConfig, durationNs, siteInfo, telemetry, mode, testOpts })
}

module.exports = build
