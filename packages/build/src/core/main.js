require('../utils/polyfills')

// eslint-disable-next-line import/order
const { setColorLevel } = require('../log/colors')
setColorLevel()

const { getPluginsOptions } = require('../plugins/options')
const { installPlugins } = require('../plugins/install')
const { startPlugins, stopPlugins } = require('../plugins/spawn')
const { loadPlugins } = require('../plugins/load')
const { logBuildStart, logBuildError, logBuildSuccess, logBuildEnd } = require('../log/main')
const { startTimer, endTimer } = require('../log/timer')
const isNetlifyCI = require('../utils/is-netlify-ci')
const { trackBuildComplete } = require('../utils/telemetry')

const { getOptions } = require('./options')
const { loadConfig } = require('./config')
const { getInstructions, runBuildInstructions, runErrorInstructions } = require('./instructions')
const { tomlWrite } = require('./toml')
const { doDryRun } = require('./dry')

/**
 * Netlify Build
 * @param  {object} options - build configuration options
 * @param  {string} [options.config] - Netlify config file path
 * @param  {string} [options.token] - Netlify API token for authentication
 * @param  {string} [options.context] - Build context
 * @param  {boolean} [options.dry] - printing commands without executing them
 * @param  {string} [options.cwd] - Current directory
 * @return {object} manifest information. @TODO implement
 */
const build = async function(options) {
  const buildTimer = startTimer()

  const optionsA = getOptions(options)

  try {
    logBuildStart()

    const { config, configPath, token, baseDir } = await loadConfig({ options: optionsA })

    const pluginsOptions = getPluginsOptions({ config })
    const pluginsOptionsA = await installPlugins(pluginsOptions, baseDir)

    const buildInstructions = await buildRun({
      pluginsOptions: pluginsOptionsA,
      config,
      configPath,
      baseDir,
      token,
      options: optionsA,
    })

    if (optionsA.dry) {
      return true
    }

    if (isNetlifyCI()) {
      await tomlWrite(config, baseDir)
    }

    logBuildSuccess()
    const duration = endTimer(buildTimer, 'Netlify Build')
    logBuildEnd({ buildInstructions, config, duration })
    await trackBuildComplete({ buildInstructions, config, duration })
    return true
  } catch (error) {
    logBuildError(error)
    return false
  }
}

const buildRun = async function({ pluginsOptions, config, configPath, baseDir, token, options }) {
  const childProcesses = await startPlugins(pluginsOptions, baseDir)

  try {
    const buildInstructions = await executeInstructions({
      pluginsOptions,
      childProcesses,
      config,
      configPath,
      baseDir,
      token,
      options,
    })
    return buildInstructions
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
  options: { dry },
}) {
  const pluginsHooks = await loadPlugins({
    pluginsOptions,
    childProcesses,
    config,
    configPath,
    baseDir,
    token,
  })

  const { buildInstructions, errorInstructions } = getInstructions({ pluginsHooks, config })

  if (dry) {
    doDryRun({ buildInstructions, configPath })
    return
  }

  try {
    await runBuildInstructions(buildInstructions, { config, configPath, token, baseDir })
    return buildInstructions
  } catch (error) {
    await runErrorInstructions(errorInstructions, { config, configPath, token, baseDir, error })
    throw error
  }
}

module.exports = build
