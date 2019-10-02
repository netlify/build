const path = require('path')
const { cwd } = require('process')

const chalk = require('chalk')
const execa = require('execa')
const filterObj = require('filter-obj')
const pMapSeries = require('p-map-series')
const pReduce = require('p-reduce')
const API = require('netlify')
const resolveConfig = require('@netlify/config')
const { formatUtils, getConfigPath } = require('@netlify/config')
require('array-flat-polyfill')

const deepLog = require('../utils/deeplog')
const { writeFile } = require('../utils/fs')
const { getSecrets, redactStream } = require('../utils/redact')
const netlifyLogs = require('../utils/patch-logs')
const defaultPlugins = require('../plugins')
const { startTimer, endTimer } = require('../utils/timer')

const { importPlugin } = require('./import')
const { LIFECYCLE } = require('./lifecycle')
const { validatePlugin } = require('./validate')
const { HEADING_PREFIX } = require('./constants')

// const pt = require('prepend-transform')

module.exports = async function build(configPath, cliFlags, token) {
  const buildTimer = startTimer()
  const netlifyConfigPath = configPath || cliFlags.config
  const baseDir = getBaseDir(netlifyConfigPath)
  const netlifyToken = token || process.env.NETLIFY_TOKEN || cliFlags.token
  /* Load config */
  let netlifyConfig = {}
  try {
    netlifyConfig = await resolveConfig(netlifyConfigPath, cliFlags)
  } catch (err) {
    console.log('Netlify Config Error')
    throw err
  }

  // console.log(chalk.cyanBright.bold('Netlify Config'))
  // deepLog(netlifyConfig)
  // console.log()

  const plugins = [...defaultPlugins, ...(netlifyConfig.plugins || [])]

  if (plugins.length) {
    console.log(chalk.cyanBright.bold(`${HEADING_PREFIX} Loading plugins`))
  }

  const lifeCycleHooks = plugins
    .filter(plug => {
      /* Load enabled plugins only */
      const name = Object.keys(plug)[0]
      const pluginConfig = plug[name] || {}
      return pluginConfig.enabled !== false && pluginConfig.enabled !== 'false'
    })
    .reduce((lifeCycleHooks, curr) => {
      // TODO refactor how plugins are included / checked
      const keys = Object.keys(curr)
      const alreadyResolved = keys.some(cur => {
        return typeof curr[cur] === 'function'
      }, false)

      const name = curr.name || keys[0]
      const pluginConfig = curr[name] || {}

      console.log(chalk.yellowBright(`Loading plugin "${name}"`))
      const code = alreadyResolved ? curr : importPlugin(name, baseDir)

      const pluginSrc = typeof code === 'function' ? code(pluginConfig) : code

      validatePlugin(pluginSrc, name)

      const meta = filterObj(pluginSrc, (key, value) => typeof value !== 'function')

      // Map plugins methods in order for later execution
      Object.entries(pluginSrc)
        .filter(([, value]) => typeof value === 'function')
        .map(([hook, method]) => ({ name, hook, pluginConfig, meta, method }))
        .forEach(lifeCycleHook => {
          const { hook } = lifeCycleHook
          /* Override core functionality */
          // Match string with 1 or more colons
          const override = hook.match(/(?:[^:]*[:]){1,}[^:]*$/)
          if (override) {
            const str = override[0]
            const [, pluginName, overideMethod] = str.match(/([a-zA-Z/@]+):([a-zA-Z/@:]+)/)
            // @TODO throw if non existant plugin trying to be overriden?
            // if (plugin not found) {
            //   throw new Error(`${pluginName} not found`)
            // }
            if (lifeCycleHooks[overideMethod]) {
              lifeCycleHooks[overideMethod] = lifeCycleHooks[overideMethod].map(x => {
                if (x.name === pluginName) {
                  return {
                    ...lifeCycleHook,
                    override: {
                      target: pluginName,
                      method: overideMethod
                    }
                  }
                }
                return x
              })
              return lifeCycleHooks
            }
          }
          /* End Override core functionality */
          if (!lifeCycleHooks[hook]) {
            lifeCycleHooks[hook] = []
          }
          lifeCycleHooks[hook] = [...lifeCycleHooks[hook], lifeCycleHook]
        })

      return lifeCycleHooks
    }, {})

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
            }
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
              await pMapSeries(commands, command => execCommand(command, redactedKeys))
            }
          }
        : undefined,
      ...(lifeCycleHooks[hook] ? lifeCycleHooks[hook] : [])
    ].filter(Boolean)
  })

  const buildInstructions = instructions.filter(instruction => {
    return instruction.hook !== 'onError'
  })

  if (cliFlags.dryRun || cliFlags.plan) {
    console.log()
    console.log(chalk.cyanBright.bold(`${HEADING_PREFIX} Netlify Build Steps`))
    console.log()

    const width = buildInstructions.reduce((acc, instruction) => {
      const { hook } = instruction
      if (hook.length > acc) return hook.length
      return acc
    }, 0)
    buildInstructions.forEach((instruction, i) => {
      const { name, hook } = instruction
      const source = name.startsWith('config.build') ? `in ${path.basename(netlifyConfigPath)}` : 'plugin'
      const count = chalk.cyanBright(`${i + 1}.`)
      const hookName = chalk.white.bold(`${rightPad(hook, width + 2, ' ')} `) // ↓
      const niceName = name.startsWith('config.build') ? name.replace(/^config\./, '') : name
      const sourceOutput = chalk.white.bold(`${niceName}`)
      console.log(chalk.cyanBright(`${count} ${hookName} source ${sourceOutput} ${source} `))
    })
    console.log()
    // deepLog(buildInstructions)
    process.exit(0)
  }
  // console.log('buildInstructions', buildInstructions)
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
}

const getBaseDir = function(netlifyConfigPath) {
  if (netlifyConfigPath === undefined) {
    return cwd()
  }

  return path.dirname(netlifyConfigPath)
}


function rightPad(str, length, char) {
  var i = -1;
  length = length - str.length;
  if (!char && char !== 0) {
    char = ' ';
  }
  while (++i < length) {
    str += char;
  }
  return str;
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
  if (override) {
    console.log(
      chalk.redBright.bold(
        `> OVERRIDE: "${override.method}" method in ${override.target} has been overriden by "${name}"`
      )
    )
  }
  const lifecycleName = error ? '' : 'lifecycle '
  const source = name.startsWith('config.build') ? `in ${path.basename(netlifyConfigPath)} config file` : 'plugin'
  const niceName = name.startsWith('config.build') ? name.replace(/^config\./, '') : name
  const logColor = error ? chalk.redBright : chalk.cyanBright
  const outputNoChalk = `${index + 1}. Running ${hook} ${lifecycleName}from ${niceName} ${source}`
  const output = `${index + 1}. Running ${chalk.white.bold(hook)} ${lifecycleName}from ${chalk.white.bold(niceName)} ${source}`
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
  if (scopes) {
    const apiMethods = Object.getPrototypeOf(apiClient)
    const apiMethodArray = Object.keys(apiMethods)

    /* validate scopes */
    scopes.forEach((scopeName, i) => {
      if (scopeName !== '*' && !apiMethodArray.includes(scopeName)) {
        console.log(chalk.redBright(`Invalid scope "${scopeName}" in "${name}" plugin.`))
        console.log(chalk.white.bold(`Please use a valid event name. One of:`))
        console.log(
          `${['*']
            .concat(apiMethodArray)
            .map(n => `"${n}"`)
            .join(', ')}`
        )
        console.log()
        throw new Error(`Invalid scope "${scopeName}" in "${name}" plugin.`)
      }
    })

    /* If scopes not *, redact the methods not allowed */
    if (!scopes.includes('*')) {
      apiMethodArray.forEach(meth => {
        if (!scopes.includes(meth)) {
          // TODO figure out if Object.setPrototypeOf will work
          apiClient.__proto__[meth] = disableApiMethod(name, meth) // eslint-disable-line
        }
      })
    }
  }

  return apiClient
}

function disableApiMethod(pluginName, method) {
  return () => {
    throw new Error(
      `The "${pluginName}" plugin is not authorized to use "api.${method}". Please update the plugin scopes.`
    )
  }
}

// Test if inside netlify build context
function isNetlifyCI() {
  return Boolean(process.env.DEPLOY_PRIME_URL)
}

// Expose Netlify config
module.exports.netlifyConfig = resolveConfig
// Expose Netlify config path getter
module.exports.getConfigPath = getConfigPath
