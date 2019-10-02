const path = require('path')
const { cwd } = require('process')

require('./colors')
const chalk = require('chalk')
const execa = require('execa')
const pMapSeries = require('p-map-series')
const pReduce = require('p-reduce')
const resolveConfig = require('@netlify/config')
const { getConfigPath } = require('@netlify/config')
const omit = require('omit.js')
require('array-flat-polyfill')

const deepLog = require('../utils/deeplog')
const cleanStack = require('../utils/clean-stack')
const { getSecrets, redactStream } = require('../utils/redact')
const netlifyLogs = require('../utils/patch-logs')
const { getPluginsHooks } = require('../plugins/main')
const { startTimer, endTimer } = require('../utils/timer')

const { LIFECYCLE } = require('./lifecycle')
const { tomlWrite } = require('./toml')
const { HEADING_PREFIX } = require('./constants')
const { doDryRun } = require('./dry')
const { getApiClient } = require('./api')

// const pt = require('prepend-transform')

module.exports = async function build(inputOptions = {}) {
  const { token } = inputOptions
  const options = omit(inputOptions, ['token'])
  try {
    const buildTimer = startTimer()

    console.log(chalk.greenBright.bold(`${HEADING_PREFIX} Starting Netlify Build`))
    console.log(`https://github.com/netlify/build`)
    console.log()

    console.log(chalk.cyanBright.bold('Options'))
    deepLog(options)
    console.log()

    const netlifyToken = token || process.env.NETLIFY_TOKEN

    const netlifyConfigPath = options.config || (await getConfigPath())
    console.log(chalk.cyanBright.bold(`${HEADING_PREFIX} Using config file: ${netlifyConfigPath}`))
    console.log()

    const baseDir = getBaseDir(netlifyConfigPath)
    /* Load config */
    let netlifyConfig = {}
    try {
      netlifyConfig = await resolveConfig(netlifyConfigPath, options)
    } catch (err) {
      console.log('Netlify Config Error')
      throw err
    }

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
    } catch (err) {
      console.log()
      console.log(chalk.redBright.bold('┌─────────────────────┐'))
      console.log(chalk.redBright.bold('│  Lifecycle Error!   │'))
      console.log(chalk.redBright.bold('└─────────────────────┘'))
      if (errorInstructions.length !== 0) {
        console.log()
        console.log(chalk.cyanBright('Running onError methods'))
        // Resolve all ‘onError’ methods and try to fix things
        await runInstructions(errorInstructions, {
          netlifyConfig,
          netlifyConfigPath,
          netlifyToken,
          baseDir,
          error: err
        })
      }
      throw err
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

const getBaseDir = function(netlifyConfigPath) {
  if (netlifyConfigPath === undefined) {
    return cwd()
  }

  return path.dirname(netlifyConfigPath)
}

// Get instructions for all hooks
const getInstructions = function({ pluginsHooks, netlifyConfig, redactedKeys }) {
  const instructions = LIFECYCLE.flatMap(hook =>
    getHookInstructions({ hook, pluginsHooks, netlifyConfig, redactedKeys })
  )
  const buildInstructions = instructions.filter(({ hook }) => hook !== 'onError')
  const errorInstructions = instructions.filter(({ hook }) => hook === 'onError')
  return { buildInstructions, errorInstructions }
}

// Get instructions for a specific hook
const getHookInstructions = function({
  hook,
  pluginsHooks,
  netlifyConfig: {
    build: { command: configCommand, lifecycle: configLifecycle }
  },
  redactedKeys
}) {
  return [
    // Support for old command. Add build.command to execution
    configCommand && hook === 'build'
      ? {
          name: `config.build.command`,
          hook: 'build',
          pluginConfig: {},
          async method() {
            await execCommand(configCommand, 'build.command', redactedKeys)
          },
          override: {}
        }
      : undefined,
    // Merge in config lifecycle events first
    configLifecycle && configLifecycle[hook]
      ? {
          name: `config.build.lifecycle.${hook}`,
          hook,
          pluginConfig: {},
          async method() {
            const commands = Array.isArray(configLifecycle[hook])
              ? configLifecycle[hook]
              : configLifecycle[hook].split('\n')
            // TODO pass in env vars if not available
            // TODO return stdout?
            await pMapSeries(commands, command => execCommand(command, `build.lifecycle.${hook}`, redactedKeys))
          },
          override: {}
        }
      : undefined,
    ...(pluginsHooks[hook] ? pluginsHooks[hook] : [])
  ].filter(Boolean)
}

async function execCommand(cmd, name, secrets) {
  console.log(chalk.yellowBright(`Running command "${cmd}"`))
  const subprocess = execa(`${cmd}`, { shell: true })
  subprocess.stdout
    // Redact ENV vars
    .pipe(redactStream(secrets))
    // Output to console
    .pipe(
      process.stdout,
      { end: true }
    )
  try {
    const { stdout } = await subprocess
    return stdout
  } catch (err) {
    console.log(chalk.redBright(`Error from netlify config ${name}:`))
    console.log(`"${cmd}"`)
    console.log()
    console.log(chalk.redBright('Error message\n'))
    console.log(err.stderr)
    console.log()
    process.exit(1)
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

const logBuildError = function(error) {
  console.log()
  console.log(chalk.redBright.bold('┌─────────────────────────────┐'))
  console.log(chalk.redBright.bold('│    Netlify Build Error!     │'))
  console.log(chalk.redBright.bold('└─────────────────────────────┘'))
  console.log(chalk.bold(` ${error.message}`))
  console.log()
  console.log(chalk.yellowBright.bold('┌─────────────────────────────┐'))
  console.log(chalk.yellowBright.bold('│      Error Stack Trace      │'))
  console.log(chalk.yellowBright.bold('└─────────────────────────────┘'))
  if (process.env.ERROR_VERBOSE) {
    console.log(error.stack)
  } else {
    console.log(` ${chalk.bold(cleanStack(error.stack))}`)
    console.log()
    console.log(` Set environment variable ERROR_VERBOSE=true for deep traces`)
  }
  console.log()
}

/**
 * Plugin engine
 * @param  {Array} methodsToRun - Plugin functions to run
 * @param  {Object} config - Netlify config file values
 * @return {Object} updated config?
 */
const runInstructions = async function(
  instructions,
  { netlifyConfig, netlifyConfigPath, netlifyToken, baseDir, error }
) {
  return await pReduce(
    instructions,
    (currentData, instruction, index) =>
      runInstruction({
        currentData,
        instruction,
        index,
        netlifyConfig,
        netlifyConfigPath,
        netlifyToken,
        baseDir,
        error
      }),
    {}
  )
}

const runInstruction = async function({
  currentData,
  instruction: { method, hook, pluginConfig, name, override, meta: { scopes } = {} },
  index,
  netlifyConfig,
  netlifyConfigPath,
  netlifyToken,
  baseDir,
  error
}) {
  const methodTimer = startTimer()

  logInstruction({
    currentData,
    method,
    hook,
    pluginConfig,
    name,
    override,
    scopes,
    index,
    netlifyConfig,
    netlifyConfigPath,
    netlifyToken,
    baseDir,
    error
  })

  const api = getApiClient({ netlifyToken, name, scopes })

  netlifyLogs.setContext(name)

  try {
    // https://github.com/netlify/cli-utils/blob/master/src/index.js#L40-L60
    const pluginReturnValue = await method({
      /* Netlify configuration file netlify.[toml|yml|json] */
      netlifyConfig,
      /* Plugin configuration */
      pluginConfig,
      /* Netlify API client */
      api,
      /* Values constants */
      constants: {
        CONFIG_PATH: path.resolve(netlifyConfigPath),
        BASE_DIR: baseDir,
        CACHE_DIR: path.join(baseDir, '.netlify', 'cache'),
        BUILD_DIR: path.join(baseDir, '.netlify', 'build')
      },
      /* Utilities helper functions */
      utils: {
        cache: {
          get: filePath => {
            console.log('get cache file')
          },
          save: (filePath, contents) => {
            console.log('save cache file')
          },
          delete: filePath => {
            console.log('delete cache file')
          }
        },
        redirects: {
          get: () => {
            console.log('get redirect')
          },
          set: () => {
            console.log('set redirect')
          },
          delete: () => {
            console.log('delete redirect')
          }
        }
      },
      /* Error for `onError` handlers */
      error
    })
    console.log()
    endTimer({ context: name.replace('config.', ''), hook }, methodTimer)
    netlifyLogs.reset()
    return Object.assign({}, currentData, pluginReturnValue)
  } catch (error) {
    console.log(chalk.redBright(`Error in ${name} plugin`))
    netlifyLogs.reset()
    throw error
  }
}

const logInstruction = function({
  currentData,
  method,
  hook,
  pluginConfig,
  name,
  override,
  scopes,
  index,
  netlifyConfig,
  netlifyConfigPath,
  netlifyToken,
  baseDir,
  error
}) {
  console.log()
  if (override.hook) {
    console.log(
      chalk.redBright.bold(`> OVERRIDE: "${override.hook}" method in ${override.name} has been overriden by "${name}"`)
    )
  }
  const lifecycleName = error ? '' : 'lifecycle '
  const source = name.startsWith('config.build') ? `in ${path.basename(netlifyConfigPath)} config file` : 'plugin'
  const niceName = name.startsWith('config.build') ? name.replace(/^config\./, '') : name
  const logColor = error ? chalk.redBright : chalk.cyanBright
  const outputNoChalk = `${index + 1}. Running ${hook} ${lifecycleName}from ${niceName} ${source}`
  const output = `${index + 1}. Running ${chalk.white.bold(hook)} ${lifecycleName}from ${chalk.white.bold(
    niceName
  )} ${source}`
  const line = '─'.repeat(outputNoChalk.length + 2)
  console.log(logColor.bold(`┌─${line}─┐`))
  console.log(logColor.bold(`│ ${output}   │`))
  console.log(logColor.bold(`└─${line}─┘`))
  console.log()
}

// Expose Netlify config
module.exports.netlifyConfig = resolveConfig
// Expose Netlify config path getter
module.exports.getConfigPath = getConfigPath
