require('../utils/polyfills')

// This needs to be done before `chalk` is loaded
// eslint-disable-next-line import/order
const { setColorLevel } = require('../log/colors')
setColorLevel()

const { getPluginsOptions } = require('../plugins/options')
const { installPlugins } = require('../plugins/install')
const { startPlugins, stopPlugins } = require('../plugins/spawn')
const { loadPlugins } = require('../plugins/load')
const { logBuildStart, logBuildError, logBuildSuccess, logBuildEnd } = require('../log/main')
const { startTimer, endTimer } = require('../log/timer')
const { trackBuildComplete } = require('../telemetry')

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
  const buildTimer = startTimer()

  try {
    logBuildStart()

    const { netlifyConfig, configPath, token, baseDir } = await loadConfig({ flags })

    const pluginsOptions = await getPluginsOptions(netlifyConfig, baseDir)
    await installPlugins(pluginsOptions, baseDir)

    const commandsCount = await buildRun({
      pluginsOptions,
      netlifyConfig,
      configPath,
      baseDir,
      token,
      flags,
    })

    if (flags.dry) {
      return true
    }

    logBuildSuccess()
    const duration = endTimer(buildTimer, 'Netlify Build')
    logBuildEnd()
    await trackBuildComplete({ commandsCount, netlifyConfig, duration, flags })
    return true
  } catch (error) {
    logBuildError(error)
    return false
  }
}

const buildRun = async function({ pluginsOptions, netlifyConfig, configPath, baseDir, token, flags }) {
  const childProcesses = await startPlugins(pluginsOptions, baseDir)

  try {
    return await executeCommands({
      pluginsOptions,
      childProcesses,
      netlifyConfig,
      configPath,
      baseDir,
      token,
      flags,
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
  baseDir,
  token,
  flags: { dry },
}) {
  const pluginsCommands = await loadPlugins({
    pluginsOptions,
    childProcesses,
    netlifyConfig,
    configPath,
    baseDir,
    token,
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
    baseDir,
  })
  return commandsCount
}

module.exports = build
