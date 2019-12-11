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
const { getInstructions, runInstructions } = require('./commands')
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

  try {
    logBuildStart()

    const { config, configPath, token, baseDir } = await loadConfig({ flags })

    const pluginsOptions = getPluginsOptions({ config })
    const pluginsOptionsA = await installPlugins(pluginsOptions, baseDir)

    const instructionsCount = await buildRun({
      pluginsOptions: pluginsOptionsA,
      config,
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
    await trackBuildComplete({ instructionsCount, config, duration, flags })
    return true
  } catch (error) {
    logBuildError(error)
    return false
  }
}

const buildRun = async function({ pluginsOptions, config, configPath, baseDir, token, flags }) {
  const childProcesses = await startPlugins(pluginsOptions, baseDir)

  try {
    return await executeInstructions({
      pluginsOptions,
      childProcesses,
      config,
      configPath,
      baseDir,
      token,
      flags,
    })
  } finally {
    await stopPlugins(childProcesses)
  }
}

const executeInstructions = async function({
  pluginsOptions,
  childProcesses,
  config,
  configPath,
  baseDir,
  token,
  flags: { dry },
}) {
  const pluginsHooks = await loadPlugins({
    pluginsOptions,
    childProcesses,
    config,
    configPath,
    baseDir,
    token,
  })

  const {
    mainInstructions,
    buildInstructions,
    endInstructions,
    errorInstructions,
    instructionsCount,
  } = getInstructions({ pluginsHooks, config })

  if (dry) {
    doDryRun({ mainInstructions, instructionsCount, configPath })
    return
  }

  await runInstructions({
    buildInstructions,
    endInstructions,
    errorInstructions,
    instructionsCount,
    configPath,
    baseDir,
  })
  return instructionsCount
}

module.exports = build
