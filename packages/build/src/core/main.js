require('../utils/polyfills')

// eslint-disable-next-line import/order
const { setColorLevel } = require('../log/colors')
setColorLevel()

const { exit } = require('process')

const resolveConfig = require('@netlify/config')
const { getConfigPath } = require('@netlify/config')

const { getPluginsOptions } = require('../plugins/options')
const { installPlugins } = require('../plugins/install')
const { loadPlugins } = require('../plugins/load')
const {
  logBuildStart,
  logLifeCycleStart,
  logManifest,
  logBuildError,
  logBuildSuccess,
  logBuildEnd
} = require('../log/main')
const { startTimer, endTimer } = require('../log/timer')
const isNetlifyCI = require('../utils/is-netlify-ci')

const { getOptions } = require('./options')
const { loadConfig } = require('./config')
const { handleInstructionError } = require('./error')
const { getInstructions, runInstructions } = require('./instructions')
const { tomlWrite } = require('./toml')
const { doDryRun } = require('./dry')

/**
 * Netlify Build
 * @param  {object} options - build configuration options
 * @param  {string} [options.config] - Netlify config file path
 * @param  {string} [options.token] - Netlify API token for authentication
 * @param  {string} [options.context] - Build context
 * @param  {boolean} [options.dry] - printing commands without executing them
 * @param  {boolean} [options.verbose] - Print messages and errors verbosely
 * @return {object} manifest information. @TODO implement
 */
const build = async function(options) {
  const optionsA = getOptions(options)

  const buildTimer = startTimer()

  try {
    logBuildStart()

    const { config, configPath, token, baseDir } = await loadConfig({ options: optionsA })

    const pluginsOptions = getPluginsOptions({ config })
    const pluginsOptionsA = await installPlugins(pluginsOptions, baseDir)
    const pluginsHooks = await loadPlugins({ pluginsOptions: pluginsOptionsA, config, configPath, baseDir, token })

    const { buildInstructions, errorInstructions } = getInstructions({ pluginsHooks, config })
    const instructions = buildInstructions
    /* If the `dry` option is specified, do a dry run and exit */
    if (optionsA.dry) {
      doDryRun({ buildInstructions, configPath })
      exit(0)
    }

    logLifeCycleStart(buildInstructions)

    try {
      const manifest = await runInstructions(buildInstructions, { config, configPath, token, baseDir })
      logManifest(manifest)
    } catch (error) {
      await handleInstructionError(errorInstructions, { config, configPath, token, baseDir, error })
      throw error
    }

    /* Temporary write config file out to toml for remote CI to process */
    if (isNetlifyCI()) {
      await tomlWrite(config, baseDir)
    }

    logBuildSuccess()
    const duration = endTimer(buildTimer, 'Netlify Build')
    logBuildEnd({ instructions, config, duration })
  } catch (error) {
    logBuildError(error, optionsA)
  }
}

module.exports = build
module.exports.resolveConfig = resolveConfig
module.exports.getConfigPath = getConfigPath
