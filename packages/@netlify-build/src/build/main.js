const path = require('path')
const { cwd } = require('process')

require('./colors')
const chalk = require('chalk')
const execa = require('execa')
const filterObj = require('filter-obj')
const pMapSeries = require('p-map-series')
const pReduce = require('p-reduce')
const API = require('netlify')
const resolveConfig = require('@netlify/config')
const { formatUtils, getConfigPath } = require('@netlify/config')
const omit = require('omit.js')
const groupBy = require('group-by')
require('array-flat-polyfill')

const deepLog = require('../utils/deeplog')
const cleanStack = require('../utils/clean-stack')
const { writeFile } = require('../utils/fs')
const { getSecrets, redactStream } = require('../utils/redact')
const netlifyLogs = require('../utils/patch-logs')
const defaultPlugins = require('../plugins')
const { startTimer, endTimer } = require('../utils/timer')

const { importPlugin } = require('./import')
const { LIFECYCLE } = require('./lifecycle')
const { validatePlugin } = require('./validate')
const { HEADING_PREFIX } = require('./constants')
const { getOverride, isNotOverridden } = require('./override.js')

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

    const plugins = [...defaultPlugins, ...(netlifyConfig.plugins || [])]

    if (plugins.length) {
      console.log(chalk.cyanBright.bold(`${HEADING_PREFIX} Loading plugins`))
    }

    const hooksArray = plugins
      .map(plugin => {
        if (plugin.core) {
          return plugin
        }

        const [name] = Object.keys(plugin)
        const pluginConfig = plugin[name]
        return { ...pluginConfig, name }
      })
      .filter(({ enabled }) => String(enabled) !== 'false')
      .flatMap(pluginConfig => {
        const { core, name } = pluginConfig
        console.log(chalk.yellowBright(`Loading plugin "${name}"`))
        const code = core ? pluginConfig : importPlugin(name, baseDir)

        const pluginSrc = typeof code === 'function' ? code(pluginConfig) : code

        validatePlugin(pluginSrc, name)

        const meta = filterObj(pluginSrc, (key, value) => typeof value !== 'function')

        // TODO: validate allowed characters in `pluginSrc` properties
        return Object.entries(pluginSrc)
          .filter(([, value]) => typeof value === 'function')
          .map(([hook, method]) => {
            const override = getOverride(hook)
            return { name, hook: override.hook || hook, pluginConfig, meta, method, override }
          })
      })
      .filter(isNotOverridden)
    const lifeCycleHooks = groupBy(hooksArray, 'hook')

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

    const {
      build: { command: configCommand, lifecycle: configLifecycle }
    } = netlifyConfig
    /* Get active build instructions */
    const instructions = LIFECYCLE.flatMap(hook => {
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
        ...(lifeCycleHooks[hook] ? lifeCycleHooks[hook] : [])
      ].filter(Boolean)
    })

    const buildInstructions = instructions.filter(instruction => {
      return instruction.hook !== 'onError'
    })

    if (options.dry) {
      console.log()
      console.log(chalk.cyanBright.bold(`${HEADING_PREFIX} Netlify Build Steps`))
      console.log()

      const width = Math.max(...buildInstructions.map(({ hook }) => hook.length))
      buildInstructions.forEach(({ name, hook }, index) => {
        const source = name.startsWith('config.build') ? `in ${path.basename(netlifyConfigPath)}` : 'plugin'
        const count = chalk.cyanBright(`${index + 1}.`)
        const hookName = chalk.white.bold(`${hook.padEnd(width + 2)} `)
        const niceName = name.startsWith('config.build') ? name.replace(/^config\./, '') : name
        const sourceOutput = chalk.white.bold(niceName)
        console.log(chalk.cyanBright(`${count} ${hookName} source ${sourceOutput} ${source} `))
      })
      console.log()
      process.exit(0)
    }
    /* patch environment dependencies */

    /* Execute build with plugins */
    console.log()
    console.log(chalk.greenBright.bold('Running Netlify Build Lifecycle'))
    console.log()
    try {
      // TODO refactor engine args
      const manifest = await engine({
        instructions: buildInstructions,
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
      netlifyLogs.reset()
      console.log()
      console.log(chalk.redBright.bold('┌─────────────────────┐'))
      console.log(chalk.redBright.bold('│  Lifecycle Error!   │'))
      console.log(chalk.redBright.bold('└─────────────────────┘'))
      /* Resolve all ‘onError’ methods and try to fix things */
      const errorInstructions = instructions.filter(instruction => {
        return instruction.hook === 'onError'
      })
      if (errorInstructions) {
        console.log()
        console.log(chalk.cyanBright('Running onError methods'))
        await engine({
          instructions: errorInstructions,
          netlifyConfig,
          netlifyConfigPath,
          netlifyToken,
          baseDir,
          error: err
        })
      }
      throw err
    }

    /* Write TOML file to support current buildbot */
    const IS_NETLIFY = isNetlifyCI()
    if (IS_NETLIFY) {
      const toml = formatUtils.toml.dump(netlifyConfig)
      const tomlPath = path.join(baseDir, 'netlify.toml')
      console.log()
      console.log('TOML output:')
      console.log()
      console.log(toml)
      await writeFile(tomlPath, toml)
      console.log(`TOML file written to ${tomlPath}`)
    }

    console.log()
    console.log(chalk.greenBright.bold('┌─────────────────────────────┐'))
    console.log(chalk.greenBright.bold('│   Netlify Build Complete!   │'))
    console.log(chalk.greenBright.bold('└─────────────────────────────┘'))
    console.log()
    endTimer({ context: 'Netlify Build' }, buildTimer)
    // Reset console.log for CLI
    console.log = originalConsoleLog

    const sparkles = chalk.cyanBright('(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧')
    console.log(`\n${sparkles} Have a nice day!\n`)
  } catch (error) {
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
}

const getBaseDir = function(netlifyConfigPath) {
  if (netlifyConfigPath === undefined) {
    return cwd()
  }

  return path.dirname(netlifyConfigPath)
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

/**
 * Plugin engine
 * @param  {Array} methodsToRun - Plugin functions to run
 * @param  {Object} config - Netlify config file values
 * @return {Object} updated config?
 */
async function engine({ instructions, netlifyConfig, netlifyConfigPath, netlifyToken, baseDir, error }) {
  const returnData = await pReduce(
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

  /* Clear logs prefix */
  netlifyLogs.reset()

  return returnData
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
  // reset logs context
  netlifyLogs.reset()

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

  const apiClient = getApiClient({ netlifyToken, name, scopes })

  // set log context
  netlifyLogs.setContext(name)

  try {
    // https://github.com/netlify/cli-utils/blob/master/src/index.js#L40-L60
    const pluginReturnValue = await method({
      /* Netlify configuration file netlify.[toml|yml|json] */
      netlifyConfig,
      /* Plugin configuration */
      pluginConfig,
      /* Netlify API client */
      api: apiClient,
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
    return Object.assign({}, currentData, pluginReturnValue)
  } catch (error) {
    console.log(chalk.redBright(`Error in ${name} plugin`))
    throw error
  }
}

const getApiClient = function({ netlifyToken, name, scopes }) {
  if (!netlifyToken) {
    return
  }

  const apiClient = new API(netlifyToken)

  /* Redact API methods to scopes. Default scopes '*'... revisit */
  if (scopes && !scopes.includes('*')) {
    Object.keys(API.prototype)
      .filter(method => !scopes.includes(method))
      .forEach(method => {
        apiClient[method] = disabledApiMethod.bind(null, name, method)
      })
  }

  return apiClient
}

async function disabledApiMethod(pluginName, method) {
  throw new Error(
    `The "${pluginName}" plugin is not authorized to use "api.${method}". Please update the plugin scopes.`
  )
}

// Test if inside netlify build context
function isNetlifyCI() {
  return Boolean(process.env.DEPLOY_PRIME_URL)
}

// Expose Netlify config
module.exports.netlifyConfig = resolveConfig
// Expose Netlify config path getter
module.exports.getConfigPath = getConfigPath
