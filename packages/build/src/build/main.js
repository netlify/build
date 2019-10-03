require('./colors')
const resolveConfig = require('@netlify/config')
const { getConfigPath } = require('@netlify/config')
require('array-flat-polyfill')

const { getPluginsHooks } = require('../plugins/main')
const { startTimer, endTimer } = require('../utils/timer')

const { loadConfig } = require('./config')
const { handleInstructionError } = require('./error')
const { getInstructions, runInstructions } = require('./instructions')
const { tomlWrite } = require('./toml')
const { doDryRun } = require('./dry')
const {
  startPatchingLog,
  stopPatchingLog,
  logBuildStart,
  logLifeCycleStart,
  logManifest,
  logBuildError,
  logBuildSuccess,
  logBuildEnd
} = require('./log')

module.exports = async function build(options = {}) {
  const { redactedKeys, originalConsoleLog } = startPatchingLog()

  const buildTimer = startTimer()

  try {
    logBuildStart()

    const { config, configPath, token, baseDir } = await loadConfig({ options })

    const pluginsHooks = getPluginsHooks({ config, baseDir })
    const { buildInstructions, errorInstructions } = getInstructions({
      pluginsHooks,
      config,
      redactedKeys
    })

    doDryRun({ buildInstructions, configPath, options })

    logLifeCycleStart()

    try {
      const manifest = await runInstructions(buildInstructions, {
        config,
        configPath,
        token,
        baseDir
      })
      logManifest(manifest)
    } catch (error) {
      await handleInstructionError({
        errorInstructions,
        config,
        configPath,
        token,
        baseDir,
        error
      })
      throw error
    }

    await tomlWrite(config, baseDir)

    logBuildSuccess()
    endTimer({ context: 'Netlify Build' }, buildTimer)
    logBuildEnd()
  } catch (error) {
    logBuildError(error)
  }

  stopPatchingLog(originalConsoleLog)
}

// Expose Netlify config
module.exports.resolveConfig = resolveConfig
// Expose Netlify config path getter
module.exports.getConfigPath = getConfigPath
