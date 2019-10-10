require('../utils/polyfills')

// eslint-disable-next-line import/order
const { setColorLevel } = require('../log/colors')
setColorLevel()

const { exit } = require('process')

const resolveConfig = require('@netlify/config')
const { getConfigPath } = require('@netlify/config')

const { getPluginsOptions } = require('../plugins/options')
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

const { loadConfig } = require('./config')
const { handleInstructionError } = require('./error')
const { getInstructions, runInstructions } = require('./instructions')
const { tomlWrite } = require('./toml')
const { doDryRun } = require('./dry')

const build = async function(options = {}) {
  const buildTimer = startTimer()

  try {
    logBuildStart()

    const { config, configPath, token, baseDir } = await loadConfig({ options })

    const pluginsOptions = getPluginsOptions({ config })

    const pluginsHooks = await loadPlugins({ pluginsOptions, config, configPath, baseDir, token })
    const { buildInstructions, errorInstructions } = getInstructions({ pluginsHooks, config })

    /* If the `dry` option is specified, do a dry run and exit */
    if (options.dry) {
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
    endTimer(buildTimer, 'Netlify Build')
    logBuildEnd()
  } catch (error) {
    logBuildError(error, options)
  }
}

module.exports = build
module.exports.resolveConfig = resolveConfig
module.exports.getConfigPath = getConfigPath
