require('../utils/polyfills')

const { getChildEnv } = require('../env/main')
const { maybeCancelBuild } = require('../error/cancel')
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
const { getPackageJson } = require('../utils/package')

const { getCommands, runCommands } = require('./commands')
const { normalizeFlags, loadConfig } = require('./config')
const { doDryRun } = require('./dry')

/**
 * Main entry point of Netlify Build.
 * Runs a builds and returns whether it succeeded or not.
 * @param  {object} flags - build configuration CLI flags
 * @param  {string} [flags.config] - Netlify config file path
 * @param  {string} [flags.cwd] - Current directory
 * @param  {string} [flags.token] - Netlify API token for authentication
 * @param  {string} [flags.siteId] - Netlify Site ID
 * @param  {string} [flags.context] - Build context
 * @param  {boolean} [flags.dry] - printing commands without executing them
 */
const build = async function(flags = {}) {
  const buildTimer = startTimer()

  const logs = getBufferLogs(flags)
  logBuildStart(logs)

  const { testOpts, bugsnagKey, ...flagsA } = normalizeFlags(flags, logs)
  const errorMonitor = startErrorMonitor({ flags: flagsA, logs, bugsnagKey })

  try {
    const {
      netlifyConfig,
      configPath,
      buildDir,
      nodePath,
      api,
      dry,
      siteInfo,
      deployId,
      constants,
      context,
      branch,
      envOpt,
      telemetry,
      mode,
      buildImagePluginsDir,
    } = await loadConfig(flagsA, logs, testOpts)
    const childEnv = await getChildEnv({ netlifyConfig, buildDir, context, branch, siteInfo, deployId, envOpt, mode })
    const { packageJson: sitePackageJson } = await getPackageJson(buildDir, { normalize: false })

    try {
      const { commandsCount } = await runAndReportBuild({
        netlifyConfig,
        configPath,
        buildDir,
        nodePath,
        childEnv,
        sitePackageJson,
        buildImagePluginsDir,
        dry,
        constants,
        mode,
        api,
        errorMonitor,
        deployId,
        logs,
        testOpts,
      })

      if (!dry) {
        logBuildSuccess(logs)
        const duration = endTimer(logs, buildTimer, 'Netlify Build')
        await trackBuildComplete({ commandsCount, netlifyConfig, duration, siteInfo, telemetry, mode, testOpts })
      }

      return { success: true, logs }
    } catch (error) {
      await maybeCancelBuild({ error, api, deployId })
      logOldCliVersionError({ mode, testOpts })
      error.netlifyConfig = netlifyConfig
      error.childEnv = childEnv
      throw error
    }
  } catch (error) {
    removeErrorColors(error)
    await reportBuildError({ error, errorMonitor, logs, testOpts })
    logBuildError({ error, logs })
    return { success: false, logs }
  }
}

// Runs a build then report any plugin statuses
const runAndReportBuild = async function({
  netlifyConfig,
  configPath,
  buildDir,
  nodePath,
  childEnv,
  sitePackageJson,
  buildImagePluginsDir,
  dry,
  constants,
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
      sitePackageJson,
      buildImagePluginsDir,
      dry,
      constants,
      mode,
      errorMonitor,
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
  sitePackageJson,
  buildImagePluginsDir,
  dry,
  constants,
  mode,
  errorMonitor,
  logs,
  testOpts,
}) {
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
      sitePackageJson,
      dry,
      constants,
      errorMonitor,
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
  sitePackageJson,
  dry,
  constants,
  errorMonitor,
  logs,
  testOpts,
}) {
  const pluginsCommands = await loadPlugins({ pluginsOptions, childProcesses, netlifyConfig, constants })

  const { commands, commandsCount } = getCommands(pluginsCommands, netlifyConfig)

  if (dry) {
    doDryRun({ commands, commandsCount, logs })
    return {}
  }

  const { error, statuses } = await runCommands({
    commands,
    configPath,
    buildDir,
    nodePath,
    childEnv,
    sitePackageJson,
    errorMonitor,
    netlifyConfig,
    logs,
    testOpts,
  })
  return { commandsCount, error, statuses }
}

module.exports = build
