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

    const { netlifyConfig, netlifyConfigPath, netlifyToken, baseDir } = await loadConfig({ options })

    const pluginsHooks = getPluginsHooks(netlifyConfig, baseDir)
    const { buildInstructions, errorInstructions } = getInstructions({
      pluginsHooks,
      netlifyConfig,
      redactedKeys
    })

    doDryRun({ buildInstructions, netlifyConfigPath, options })

    logLifeCycleStart()

    try {
      const manifest = await runInstructions(buildInstructions, {
        netlifyConfig,
        netlifyConfigPath,
        netlifyToken,
        baseDir
      })
      logManifest(manifest)
    } catch (error) {
      await handleInstructionError({
        errorInstructions,
        netlifyConfig,
        netlifyConfigPath,
        netlifyToken,
        baseDir,
        error
      })
      throw error
    }

    await tomlWrite(netlifyConfig, baseDir)

    logBuildSuccess()
    endTimer({ context: 'Netlify Build' }, buildTimer)
    logBuildEnd()
  } catch (error) {
    logBuildError(error)
  }

  stopPatchingLog(originalConsoleLog)
}

// Expose Netlify config
module.exports.netlifyConfig = resolveConfig
// Expose Netlify config path getter
module.exports.getConfigPath = getConfigPath
