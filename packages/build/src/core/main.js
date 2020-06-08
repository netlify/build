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
const { reportStatuses } = require('../status/report')
const { trackBuildComplete } = require('../telemetry/complete')

const { getCommands, runCommands } = require('./commands')
const { normalizeFlags, loadConfig } = require('./config')
const { doDryRun } = require('./dry')

/**
 * Netlify Build
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
    } = await loadConfig(flagsA, logs, testOpts)
    const childEnv = await getChildEnv({ netlifyConfig, buildDir, context, branch, siteInfo, deployId, envOpt, mode })

    try {
      const pluginsOptions = await getPluginsOptions({
        netlifyConfig,
        buildDir,
        constants,
        mode,
        api,
        errorMonitor,
        deployId,
        logs,
        testOpts,
      })

      const { commandsCount, error, statuses } = await buildRun({
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

      if (dry) {
        return { success: true, logs }
      }

      await reportStatuses({ statuses, api, mode, netlifyConfig, errorMonitor, deployId, logs, testOpts })

      if (error !== undefined) {
        throw error
      }

      logBuildSuccess(logs)
      const duration = endTimer(logs, buildTimer, 'Netlify Build')
      await trackBuildComplete({ commandsCount, netlifyConfig, duration, siteInfo, telemetry, mode, testOpts })
      return { success: true, logs }
    } catch (error) {
      await maybeCancelBuild({ error, api, deployId })
      await logOldCliVersionError({ mode, testOpts })
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

const buildRun = async function({
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
  const childProcesses = await startPlugins({ pluginsOptions, buildDir, nodePath, childEnv, mode, logs })

  try {
    return await executeCommands({
      pluginsOptions,
      childProcesses,
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

const executeCommands = async function({
  pluginsOptions,
  childProcesses,
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
  const pluginsCommands = await loadPlugins({
    pluginsOptions,
    childProcesses,
    netlifyConfig,
    constants,
    mode,
    api,
    errorMonitor,
    deployId,
    logs,
    testOpts,
  })

  const { commands, commandsCount } = getCommands(pluginsCommands, netlifyConfig)

  if (dry) {
    doDryRun({ commands, commandsCount, configPath, logs })
    return {}
  }

  return runCommands({
    commands,
    configPath,
    buildDir,
    nodePath,
    childEnv,
    errorMonitor,
    netlifyConfig,
    logs,
    testOpts,
  })
}

module.exports = build
