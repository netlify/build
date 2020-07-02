require('../utils/polyfills')

const { removeErrorColors } = require('../error/colors')
const { reportBuildError } = require('../error/monitor/report')
const { startErrorMonitor } = require('../error/monitor/start')
const { getBufferLogs } = require('../log/logger')
const { logBuildStart, logBuildError, logBuildSuccess } = require('../log/main')
const { logOldCliVersionError } = require('../log/old_version')
const { startTimer, endTimer } = require('../log/timer')
const { loadPlugins } = require('../plugins/load')
const { getPluginsOptions } = require('../plugins/options')
const { startPlugins, stopPlugins } = require('../plugins/spawn')
const { getErrorStatuses } = require('../status/add')
const { reportStatuses } = require('../status/report')
const { trackBuildComplete } = require('../telemetry/complete')

const { getCommands, runCommands } = require('./commands')
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
  const {
    nodePath,
    functionsDistDir,
    buildImagePluginsDir,
    dry,
    mode,
    deployId,
    telemetry,
    testOpts,
    errorMonitor,
    logs,
    buildTimer,
    ...flagsA
  } = startBuild(flags)

  try {
    const { netlifyConfig, configPath, buildDir, childEnv, api, siteInfo } = await loadConfig({
      ...flagsA,
      mode,
      deployId,
      logs,
      testOpts,
    })
    const { commandsCount } = await runAndHandleBuild({
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
      api,
      errorMonitor,
      deployId,
      logs,
      testOpts,
    })
    await handleBuildSuccess({
      commandsCount,
      buildTimer,
      netlifyConfig,
      dry,
      siteInfo,
      telemetry,
      mode,
      logs,
      testOpts,
    })
    return { success: true, logs }
  } catch (error) {
    await handleBuildFailure({ error, errorMonitor, mode, logs, testOpts })
    return { success: false, logs }
  }
}

// Performed on build start. Must be kept small and unlikely to fail since it
// does not have proper error handling. Error handling relies on `errorMonitor`
// being built, which relies itself on flags being normalized.
const startBuild = function(flags) {
  const buildTimer = startTimer()

  const logs = getBufferLogs(flags)
  logBuildStart(logs)

  const { bugsnagKey, ...flagsA } = normalizeFlags(flags, logs)
  const errorMonitor = startErrorMonitor({ flags: flagsA, logs, bugsnagKey })
  return { ...flagsA, errorMonitor, logs, buildTimer }
}

// Runs a build and handle it on failure
const runAndHandleBuild = async function({
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
  api,
  errorMonitor,
  deployId,
  logs,
  testOpts,
}) {
  try {
    return await runAndReportBuild({
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
      api,
      errorMonitor,
      deployId,
      logs,
      testOpts,
    })
  } catch (error) {
    Object.assign(error, { netlifyConfig, childEnv })
    throw error
  }
}

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
  api,
  errorMonitor,
  deployId,
  logs,
  testOpts,
}) {
  try {
    const { commandsCount, error, statuses } = await initAndRunBuild({
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
      api,
      errorMonitor,
      deployId,
      logs,
      testOpts,
    })
    await reportStatuses({ statuses, api, mode, netlifyConfig, errorMonitor, deployId, logs, testOpts })

    if (error !== undefined) {
      throw error
    }

    return { commandsCount }
    // Thrown errors can have statuses attached to them.
    // However returned `error` should return `statuses` instead.
  } catch (error) {
    const statuses = getErrorStatuses(error)
    await reportStatuses({ statuses, api, mode, netlifyConfig, errorMonitor, deployId, logs, testOpts })
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
  api,
  errorMonitor,
  deployId,
  logs,
  testOpts,
}) {
  const constants = await getConstants({ configPath, buildDir, functionsDistDir, netlifyConfig, siteInfo, mode })
  const pluginsOptions = await getPluginsOptions({
    netlifyConfig,
    buildDir,
    constants,
    mode,
    buildImagePluginsDir,
    logs,
  })

  const childProcesses = await startPlugins({ pluginsOptions, buildDir, nodePath, childEnv, mode, logs })

  try {
    const { commandsCount, error, statuses } = await runBuild({
      childProcesses,
      pluginsOptions,
      netlifyConfig,
      configPath,
      buildDir,
      nodePath,
      childEnv,
      dry,
      constants,
      api,
      errorMonitor,
      deployId,
      logs,
      testOpts,
    })
    return { commandsCount, error, statuses }
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
  api,
  errorMonitor,
  deployId,
  logs,
  testOpts,
}) {
  const pluginsCommands = await loadPlugins({ pluginsOptions, childProcesses, netlifyConfig, constants })

  const { commands, commandsCount } = getCommands(pluginsCommands, netlifyConfig)

  if (dry) {
    doDryRun({ commands, commandsCount, logs })
    return {}
  }

  const { commandsCount: commandsCountA, error, statuses } = await runCommands({
    commands,
    configPath,
    buildDir,
    nodePath,
    childEnv,
    api,
    errorMonitor,
    deployId,
    netlifyConfig,
    logs,
    testOpts,
  })
  return { commandsCount: commandsCountA, error, statuses }
}

// Logs and reports that a build successfully ended
const handleBuildSuccess = async function({
  commandsCount,
  buildTimer,
  netlifyConfig,
  dry,
  siteInfo,
  telemetry,
  mode,
  logs,
  testOpts,
}) {
  if (dry) {
    return
  }

  logBuildSuccess(logs)

  const duration = endTimer(logs, buildTimer, 'Netlify Build')
  await trackBuildComplete({ commandsCount, netlifyConfig, duration, siteInfo, telemetry, mode, testOpts })
}

// Logs and reports that a build failed
const handleBuildFailure = async function({ error, errorMonitor, mode, logs, testOpts }) {
  removeErrorColors(error)
  await reportBuildError({ error, errorMonitor, logs, testOpts })
  logBuildError({ error, logs })
  logOldCliVersionError({ mode, testOpts })
}

module.exports = build
