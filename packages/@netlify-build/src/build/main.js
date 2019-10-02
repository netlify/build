require('./colors')
const chalk = require('chalk')
const resolveConfig = require('@netlify/config')
const { getConfigPath } = require('@netlify/config')
require('array-flat-polyfill')

const deepLog = require('../utils/deeplog')
const { getSecrets } = require('../utils/redact')
const netlifyLogs = require('../utils/patch-logs')
const { getPluginsHooks } = require('../plugins/main')
const { startTimer, endTimer } = require('../utils/timer')

const { loadConfig } = require('./config')
const { handleInstructionError, logBuildError } = require('./error')
const { getInstructions, runInstructions } = require('./instructions')
const { tomlWrite } = require('./toml')
const { HEADING_PREFIX } = require('./constants')
const { doDryRun } = require('./dry')

module.exports = async function build(options = {}) {
  try {
    const buildTimer = startTimer()

    console.log(chalk.greenBright.bold(`${HEADING_PREFIX} Starting Netlify Build`))
    console.log(`https://github.com/netlify/build`)
    console.log()

    const { netlifyConfig, netlifyConfigPath, netlifyToken, baseDir } = await loadConfig({ options })

    const pluginsHooks = getPluginsHooks(netlifyConfig, baseDir)

    if (netlifyConfig.build.lifecycle && netlifyConfig.build.command) {
      throw new Error(
        `build.command && build.lifecycle are both defined in config file. Please move build.command to build.lifecycle.build`
      )
    }

    /* Get user set ENV vars and redact */
    const redactedKeys = getSecrets(['SECRET_ENV_VAR', 'MY_API_KEY'])
    /* Monkey patch console.log */
    const originalConsoleLog = console.log
    console.log = netlifyLogs.patch(redactedKeys)

    const { buildInstructions, errorInstructions } = getInstructions({
      pluginsHooks,
      netlifyConfig,
      redactedKeys
    })

    doDryRun({ buildInstructions, netlifyConfigPath, options })

    /* Execute build with plugins */
    console.log()
    console.log(chalk.greenBright.bold('Running Netlify Build Lifecycle'))
    console.log()
    try {
      // TODO refactor engine args
      const manifest = await runInstructions(buildInstructions, {
        netlifyConfig,
        netlifyConfigPath,
        netlifyToken,
        baseDir
      })
      if (Object.keys(manifest).length) {
        console.log('Manifest:')
        deepLog(manifest)
      }
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

    // Reset console.log for CLI
    console.log = originalConsoleLog
  } catch (error) {
    logBuildError(error)
  }
}

const logBuildSuccess = function() {
  console.log()
  console.log(chalk.greenBright.bold('┌─────────────────────────────┐'))
  console.log(chalk.greenBright.bold('│   Netlify Build Complete!   │'))
  console.log(chalk.greenBright.bold('└─────────────────────────────┘'))
  console.log()
}

const logBuildEnd = function() {
  const sparkles = chalk.cyanBright('(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧')
  console.log(`\n${sparkles} Have a nice day!\n`)
}

// Expose Netlify config
module.exports.netlifyConfig = resolveConfig
// Expose Netlify config path getter
module.exports.getConfigPath = getConfigPath
