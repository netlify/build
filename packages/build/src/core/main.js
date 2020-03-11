require('../utils/polyfills')

// This needs to be done before `chalk` is loaded
// eslint-disable-next-line import/order
const { setColorLevel } = require('../log/colors')
setColorLevel()
require('../error/process')

const { getPluginsOptions } = require('../plugins/options')
const { installPlugins } = require('../plugins/install')
const { startPlugins, stopPlugins } = require('../plugins/spawn')
const { startUtils } = require('../plugins/child/utils')
const { loadPlugins } = require('../plugins/load')
const { getChildEnv } = require('../plugins/env')
const { logBuildStart, logBuildError, logBuildSuccess, logBuildEnd } = require('../log/main')
const { startTimer, endTimer } = require('../log/timer')
const { trackBuildComplete } = require('../telemetry/complete')
const { handleBuildError } = require('../error/handle')

const { loadConfig } = require('./config')
const { getCommands, runCommands } = require('./commands')
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
      context,
      branch,
    } = await loadConfig(flags)

    try {
      const pluginsOptions = await getPluginsOptions(netlifyConfig, buildDir, configPath)
      await installPlugins(pluginsOptions, buildDir)

      const commandsCount = await buildRun({
        pluginsOptions,
        netlifyConfig,
        configPath,
        buildDir,
        nodePath,
        token,
        dry,
        siteInfo,
        context,
        branch,
      })

      if (dry) {
        return true
      }

      logBuildSuccess()
      const duration = endTimer(buildTimer, 'Netlify Build')
      logBuildEnd()
      await trackBuildComplete({ commandsCount, netlifyConfig, duration, siteInfo })
      return true
    } catch (error) {
      await handleBuildError(error, api)
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
  context,
  branch,
}) {
  const utilsData = await startUtils(buildDir)
  const childEnv = await getChildEnv({ netlifyConfig, buildDir, context, branch, siteInfo })
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
      siteInfo,
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
  siteInfo,
}) {
  const pluginsCommands = await loadPlugins({
    pluginsOptions,
    childProcesses,
    netlifyConfig,
    utilsData,
    configPath,
    buildDir,
    token,
    siteInfo,
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
    commandsCount,
    configPath,
    buildDir,
    nodePath,
    childEnv,
  })
  return commandsCount
}

module.exports = build
