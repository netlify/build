require('../utils/polyfills')

const { getCommands } = require('../commands/get')
const { runCommands } = require('../commands/run')
const { handleBuildError } = require('../error/handle')
const { getErrorInfo } = require('../error/info')
const { startErrorMonitor } = require('../error/monitor/start')
const { getBufferLogs } = require('../log/logger')
const { logBuildStart, logBuildSuccess } = require('../log/main')
const { logTimer } = require('../log/main')
const { startTimer, endTimer } = require('../log/timer')
const { loadPlugins } = require('../plugins/load')
const { getPluginsOptions } = require('../plugins/options')
const { startPlugins, stopPlugins } = require('../plugins/spawn')
const { reportStatuses } = require('../status/report')
const { trackBuildComplete } = require('../telemetry/complete')

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

  const { netlifyConfig, configPath, buildDir, childEnv, api, siteInfo, error } = await resolveConfig({
    ...flagsA,
    mode,
    deployId,
    logs,
    testOpts,
  })
  if (error !== undefined) {
    await handleBuildError({ error, errorMonitor, netlifyConfig, childEnv, mode, logs, testOpts })
    return { success: false, logs }
  }

  try {
    const { commandsCount } = await runAndReportBuild({
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
    await handleBuildError({ error, errorMonitor, netlifyConfig, childEnv, mode, logs, testOpts })
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

const resolveConfig = async function(opts) {
  try {
    return await loadConfig(opts)
  } catch (error) {
    return { error }
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
    const { commandsCount, statuses } = await initAndRunBuild({
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
    await reportStatuses({ statuses, childEnv, api, mode, netlifyConfig, errorMonitor, deployId, logs, testOpts })

    return { commandsCount }
  } catch (error) {
    const { statuses } = getErrorInfo(error)
    await reportStatuses({ statuses, childEnv, api, mode, netlifyConfig, errorMonitor, deployId, logs, testOpts })
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
  testOpts,
}) {
  const pluginsCommands = await loadPlugins({ pluginsOptions, childProcesses, netlifyConfig, constants })

  const { commands, commandsCount } = getCommands(pluginsCommands, netlifyConfig)

  if (dry) {
    doDryRun({ commands, commandsCount, logs })
    return {}
  }

  const { commandsCount: commandsCountA, statuses } = await runCommands({
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
    testOpts,
  })
  return { commandsCount: commandsCountA, statuses }
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

  const durationMs = endTimer(buildTimer)
  logTimer(logs, durationMs, 'Netlify Build')
  await trackBuildComplete({ commandsCount, netlifyConfig, durationMs, siteInfo, telemetry, mode, testOpts })
}

module.exports = build
