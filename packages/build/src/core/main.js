require('../utils/polyfills')

// This needs to be done before `chalk` is loaded
// eslint-disable-next-line import/order
const { setColorLevel } = require('../log/colors')
setColorLevel()
require('../error/process')

const { getChildEnv } = require('../env/main')
const { handleBuildError } = require('../error/handle')
const { installLocalPluginsDependencies } = require('../install/local')
const { logBuildStart, logBuildError, logBuildSuccess } = require('../log/main')
const { logOldCliVersionError } = require('../log/old_version')
const { startTimer, endTimer } = require('../log/timer')
const { startUtils } = require('../plugins/child/utils')
const { loadPlugins } = require('../plugins/load')
const { getPluginsOptions } = require('../plugins/options')
const { startPlugins, stopPlugins } = require('../plugins/spawn')
const { trackBuildComplete } = require('../telemetry/complete')

const { getCommands, runCommands } = require('./commands')
const { loadConfig } = require('./config')
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
const build = async function(flags) {
  try {
    const buildTimer = startTimer()

    logBuildStart()

    const {
      netlifyConfig,
      configPath,
      buildDir,
      nodePath,
      token,
      api,
      dry,
      siteInfo,
      constants,
      context,
      branch,
      mode,
    } = await loadConfig(flags)

    try {
      const pluginsOptions = await getPluginsOptions({ netlifyConfig, buildDir, mode })
      await installLocalPluginsDependencies({ pluginsOptions, buildDir, mode })

      const commandsCount = await buildRun({
        pluginsOptions,
        netlifyConfig,
        configPath,
        buildDir,
        nodePath,
        token,
        dry,
        siteInfo,
        constants,
        context,
        branch,
        mode,
      })

      if (dry) {
        return true
      }

      logBuildSuccess()
      const duration = endTimer(buildTimer, 'Netlify Build')
      await trackBuildComplete({ commandsCount, netlifyConfig, duration, siteInfo, mode })
      return true
    } catch (error) {
      await handleBuildError(error, api)
      await logOldCliVersionError(mode)
      throw error
    }
  } catch (error) {
    logBuildError(error)
    return false
  }
}

const buildRun = async function({
  pluginsOptions,
  netlifyConfig,
  configPath,
  buildDir,
  nodePath,
  token,
  dry,
  siteInfo,
  constants,
  context,
  branch,
  mode,
}) {
  const utilsData = await startUtils(buildDir)
  const childEnv = await getChildEnv({ netlifyConfig, buildDir, context, branch, siteInfo, mode })
  const childProcesses = await startPlugins({ pluginsOptions, buildDir, nodePath, childEnv })

  try {
    return await executeCommands({
      pluginsOptions,
      childProcesses,
      netlifyConfig,
      utilsData,
      configPath,
      buildDir,
      nodePath,
      childEnv,
      token,
      dry,
      constants,
      mode,
    })
  } finally {
    await stopPlugins(childProcesses)
  }
}

const executeCommands = async function({
  pluginsOptions,
  childProcesses,
  netlifyConfig,
  utilsData,
  configPath,
  buildDir,
  nodePath,
  childEnv,
  token,
  dry,
  constants,
  mode,
}) {
  const pluginsCommands = await loadPlugins({
    pluginsOptions,
    childProcesses,
    netlifyConfig,
    utilsData,
    token,
    constants,
  })

  const { mainCommands, buildCommands, endCommands, errorCommands, commandsCount } = getCommands({
    pluginsCommands,
    netlifyConfig,
  })

  if (dry) {
    doDryRun({ mainCommands, commandsCount, configPath })
    return
  }

  await runCommands({
    buildCommands,
    endCommands,
    errorCommands,
    configPath,
    buildDir,
    nodePath,
    childEnv,
    mode,
  })
  return commandsCount
}

module.exports = build
