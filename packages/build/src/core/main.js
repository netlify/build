// eslint-disable-next-line import/order
const { setColorLevel } = require('../log/colors')
setColorLevel()

const resolveConfig = require('@netlify/config')
const { getConfigPath } = require('@netlify/config')

require('array-flat-polyfill')

const { loadPlugins } = require('../plugins/parent/load')
const { getPluginsOptions } = require('../plugins/parent/options')
const { startPlugins, stopPlugins } = require('../plugins/parent/spawn')
const {
  startPatchingLog,
  stopPatchingLog,
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
  const { redactedKeys, originalConsoleLog } = startPatchingLog()

  const buildTimer = startTimer()

  try {
    logBuildStart()

    const { config, configPath, token, baseDir } = await loadConfig({ options })

    const pluginsOptions = getPluginsOptions({ config })
    const childProcesses = await startPlugins(pluginsOptions, baseDir)

    try {
      await runBuild({
        pluginsOptions,
        childProcesses,
        config,
        configPath,
        baseDir,
        redactedKeys,
        token,
        options
      })
    } finally {
      await stopPlugins(childProcesses)
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

  stopPatchingLog(originalConsoleLog)
}

const runBuild = async function({
  pluginsOptions,
  childProcesses,
  config,
  configPath,
  baseDir,
  redactedKeys,
  token,
  options
}) {
  const pluginsHooks = await loadPlugins({
    pluginsOptions,
    childProcesses,
    config,
    configPath,
    baseDir,
    redactedKeys,
    token
  })
  const { buildInstructions, errorInstructions } = getInstructions({ pluginsHooks, config })

  doDryRun({ buildInstructions, configPath, options })

  logLifeCycleStart(buildInstructions)

  try {
    const manifest = await runInstructions(buildInstructions, { childProcesses, configPath, baseDir, redactedKeys })
    logManifest(manifest)
  } catch (error) {
    await handleInstructionError(errorInstructions, { childProcesses, configPath, baseDir, redactedKeys, error })
    throw error
  }
}

module.exports = build
module.exports.resolveConfig = resolveConfig
module.exports.getConfigPath = getConfigPath
