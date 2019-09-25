const path = require('path')

const chalk = require('chalk')
const execa = require('execa')
const API = require('netlify')
const resolveConfig = require('@netlify/config')
const { formatUtils, getConfigFile } = require('@netlify/config')

const deepLog = require('./utils/deeplog')
const { writeFile } = require('./utils/fs')
const { getSecrets, redactStream } = require('./utils/redact')
const netlifyLogs = require('./utils/patch-logs')
const netlifyFunctionsPlugin = require('./plugins/functions')
const baseDir = process.cwd()

// const pt = require('prepend-transform')
const lifecycle = [
  /* Build initialization steps */
  'init',
  /* Fetch previous build cache */
  'getCache',
  /* Install project dependancies */
  'install',
  /* Build the site & functions */
  'build', // 'build:site', 'build:function',
  'buildSite',
  'buildFunctions',
  /* Package & optimize artifact */
  'package',
  /* Deploy built artifact */
  'deploy',
  /* Save cached assets */
  'saveCache',
  /* Outputs manifest of resources created */
  'manifest',
  /* Build finished */
  'finally'
]

const TIME_KEY = 'Netlify Build'

module.exports = async function build(configPath, cliFlags, token) {
  console.time(TIME_KEY)
  const netlifyConfigPath = configPath || cliFlags.config
  const netlifyToken = token || process.env.NETLIFY_TOKEN || cliFlags.token
  /* Load config */
  let netlifyConfig = {}
  try {
    netlifyConfig = await resolveConfig(netlifyConfigPath, cliFlags)
  } catch (err) {
    console.log('Netlify Config Error')
    throw err
  }
  console.log(chalk.cyanBright.bold('Netlify Config'))
  deepLog(netlifyConfig)
  console.log()

  /* Parse plugins */
  const initialPlugins = netlifyConfig.plugins || []
  const defaultPlugins = [
    // default Netlify Function bundling and deployment
    netlifyFunctionsPlugin
    // netlifyDeployPlugin(),
  ].map(plug => {
    return Object.assign({}, plug, {
      core: true
    })
  })

  const plugins = defaultPlugins.concat(initialPlugins)
  const allPlugins = plugins
    .filter(plug => {
      /* Load enabled plugins only */
      const name = Object.keys(plug)[0]
      const pluginConfig = plug[name] || {}
      return pluginConfig.enabled !== false && pluginConfig.enabled !== 'false'
    })
    .reduce(
      (acc, curr) => {
        // TODO refactor how plugins are included / checked
        const keys = Object.keys(curr)
        const alreadyResolved = keys.some(cur => {
          return typeof curr[cur] === 'function'
        }, false)

        let code
        const name = curr.name || keys[0]
        const pluginConfig = curr[name] || {}
        if (alreadyResolved) {
          code = curr
          console.log(chalk.yellow(`Loading plugin "${name}" from core`))
        } else {
          try {
            // resolve file path
            // TODO harden resolution
            let filePath
            if (name.match(/^\./)) {
              filePath = path.resolve(baseDir, name)
            } else {
              // If module scoped add @ symbol prefix
              const formattedName = name.match(/^netlify\//) ? `@${name.replace(/^@/, '')}` : name
              filePath = path.resolve(baseDir, 'node_modules', formattedName)
            }
            console.log(chalk.yellow(`Loading plugin "${name}" from ${filePath}`))
            code = require(filePath)
          } catch (e) {
            console.log(`Error loading ${name} plugin`)
            console.log(e)
            // TODO If plugin not found, automatically try and install and retry here
            // await execa(`npm install ${name}`)
          }
        }

        if (typeof code !== 'object' && typeof code !== 'function') {
          throw new Error(`Plugin ${name} is malformed. Must be object or function`)
        }

        const pluginSrc = typeof code === 'function' ? code(pluginConfig) : code

        /* Format plugin into useable data */
        const pluginData = Object.keys(pluginSrc).reduce(
          (acc, key) => {
            const config = pluginSrc[key]
            if (typeof config === 'function') {
              acc.methods[key] = config
              return acc
            }
            acc.meta[key] = config
            return acc
          },
          {
            meta: {},
            methods: {}
          }
        )

        // Map plugins methods in order for later execution
        Object.keys(pluginData.methods).forEach(hook => {
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
            if (acc.lifeCycleHooks[overideMethod]) {
              acc.lifeCycleHooks[overideMethod] = acc.lifeCycleHooks[overideMethod].map(x => {
                if (x.name === pluginName) {
                  return {
                    name: name,
                    hook: hook,
                    config: pluginConfig,
                    meta: pluginData.meta,
                    method: pluginSrc[hook],
                    override: {
                      target: pluginName,
                      method: overideMethod
                    }
                  }
                }
                return x
              })
              return acc
            }
          }
          /* End Override core functionality */
          if (!acc.lifeCycleHooks[hook]) {
            acc.lifeCycleHooks[hook] = []
          }
          acc.lifeCycleHooks[hook] = acc.lifeCycleHooks[hook].concat({
            name: name,
            hook: hook,
            meta: pluginData.meta,
            config: pluginConfig,
            method: pluginSrc[hook]
          })
        })

        return acc
      },
      {
        lifeCycleHooks: {}
      }
    )

  if (!netlifyConfig.build) {
    throw new Error('No build settings found')
  }
  // console.log('Build Lifecycle:')
  // deepLog(allPlugins)

  // Add pre & post hooks
  let fullLifecycle = lifecycle.reduce((acc, hook) => {
    if (hook === 'finally' || hook === 'init') {
      acc = acc.concat([hook])
      return acc
    }
    acc = acc.concat([preFix(hook), hook, postFix(hook)])
    return acc
  }, [])

  fullLifecycle = fullLifecycle.concat(['onError', 'scopes'])
  // console.log('fullLifecycle', fullLifecycle)

  /* Validate lifecyle key name */
  Object.keys(allPlugins.lifeCycleHooks).forEach((name, i) => {
    const info = allPlugins.lifeCycleHooks[name]
    if (!fullLifecycle.includes(name)) {
      const brokenPlugins = info
        .map(plug => {
          return plug.name
        })
        .join(',')
      console.log(chalk.redBright(`Invalid lifecycle hook "${name}" in ${brokenPlugins}.`))
      console.log(`Please use a valid event name. One of:`)
      console.log(`${fullLifecycle.map(n => `"${n}"`).join(', ')}`)
      throw new Error(`Invalid lifecycle hook`)
    }
  })

  if (netlifyConfig.build && netlifyConfig.build.lifecycle && netlifyConfig.build.command) {
    throw new Error(
      `build.command && build.lifecycle are both defined. Please move build.command to build.lifecycle.build`
    )
  }

  /* Get user set ENV vars and redact */
  const redactedKeys = getSecrets(['SECRET_ENV_VAR', 'MY_API_KEY'])
  /* Monkey patch console.log */
  const originalConsoleLog = console.log
  console.log = netlifyLogs.patch(redactedKeys)

  /* Get active build instructions */
  const instructions = fullLifecycle.reduce((acc, n) => {
    // Support for old command. Add build.command to execution
    if (netlifyConfig.build.command && n === 'build') {
      acc = acc.concat({
        name: `config.build.command`,
        hook: 'build',
        config: {},
        method: async () => {
          try {
            await execCommand(netlifyConfig.build.command, redactedKeys)
          } catch (err) {
            console.log(chalk.redBright(`Error from netlify config.build.command:`))
            console.log(`"${netlifyConfig.build.command}"`)
            console.log()
            console.log(chalk.redBright('Error message\n'))
            console.log(err.stderr)
            console.log()
            process.exit(1)
          }
        }
      })
    }
    /* Merge in config lifecycle events first */
    if (netlifyConfig.build.lifecycle && netlifyConfig.build.lifecycle[n]) {
      const cmds = netlifyConfig.build.lifecycle[n]
      acc = acc.concat({
        name: `config.build.lifecycle.${n}`,
        hook: n,
        config: {},
        method: async () => {
          try {
            const commands = Array.isArray(cmds) ? cmds : cmds.split('\n')
            const doCommands = commands.reduce(async (promiseChain, curr) => {
              const data = await promiseChain
              // TODO pass in env vars if not available
              const stdout = await execCommand(curr, redactedKeys)
              return Promise.resolve(data.concat(stdout))
            }, Promise.resolve([]))
            // TODO return stdout?
            const output = await doCommands // eslint-disable-line
          } catch (err) {
            console.log(chalk.redBright(`Error from netlify config build.lifecycle.${n} n from command:`))
            console.log(`"${netlifyConfig.build.lifecycle[n]}"`)
            console.log()
            console.log(chalk.redBright('Error message\n'))
            console.log(err.stderr)
            console.log()
            process.exit(1)
          }
        }
      })
    }

    if (allPlugins.lifeCycleHooks[n]) {
      acc = acc.concat(allPlugins.lifeCycleHooks[n])
    }
    return acc
  }, [])

  const buildInstructions = instructions.filter(instruction => {
    return instruction.hook !== 'onError'
  })

  if (cliFlags.dryRun || cliFlags.plan) {
    console.log()
    console.log(chalk.cyanBright.bold('Netlify Build Steps'))
    console.log()
    buildInstructions.forEach((instruction, i) => {
      const { name, hook } = instruction
      const source = name.match(/^config\.build/) ? 'config' : 'plugin'
      const count = chalk.cyanBright(`${i + 1}.`)
      const hookName = chalk.bold(`"${hook}"`)
      const sourceOutput = chalk.yellow(`${name}`)
      console.log(`${count}  ${hookName} lifecycle hook from ${source} "${sourceOutput}"`)
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
      netlifyToken
    })
    console.log()
    console.log(chalk.greenBright.bold('┌───────────────────────────┐'))
    console.log(chalk.greenBright.bold('│  Netlify Build Complete!  │'))
    console.log(chalk.greenBright.bold('└───────────────────────────┘'))
    console.log()
    if (Object.keys(manifest).length) {
      console.log('Manifest:')
      deepLog(manifest)
    }
  } catch (err) {
    console.log(chalk.redBright('Lifecycle error'))
    /* Resolve all ‘onError’ methods and try to fix things */
    const errorInstructions = instructions.filter(instruction => {
      return instruction.hook === 'onError'
    })
    if (errorInstructions) {
      console.log(chalk.greenBright('Running onError methods'))
      await engine({
        instructions: errorInstructions,
        netlifyConfig,
        netlifyConfigPath,
        netlifyToken,
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
  console.timeEnd(TIME_KEY)
  // Reset console.log for CLI
  console.log = originalConsoleLog
}

function preFix(hook) {
  return `pre${hook}`
}

function postFix(hook) {
  return `post${hook}`
}

async function execCommand(cmd, secrets) {
  console.log(chalk.yellowBright(`Running "${cmd}"`))
  const subprocess = execa(`${cmd}`, { shell: true })
  subprocess.stdout
    // Redact ENV vars
    .pipe(redactStream(secrets))
    // Output to console
    .pipe(
      process.stdout,
      { end: true }
    )
  const { stdout } = await subprocess
  return stdout
}

/**
 * Plugin engine
 * @param  {Array} methodsToRun - Plugin functions to run
 * @param  {Object} config - Netlify config file values
 * @return {Object} updated config?
 */
async function engine({ instructions, netlifyConfig, netlifyConfigPath, netlifyToken, error }) {
  const returnData = await instructions.reduce(async (promiseChain, plugin, i) => {
    const { method, hook, config, name, override } = plugin
    const meta = plugin.meta || {}
    const currentData = await promiseChain
    if (method && typeof method === 'function') {
      console.time(name)
      const source = name.match(/^config\.build/) ? 'via config' : 'plugin'
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
      console.log(chalk.cyanBright.bold(`> ${i + 1}. Running "${hook}" lifecycle from "${name}" ${source}`))
      console.log()
      let apiClient
      if (netlifyToken) {
        apiClient = new API(netlifyToken)
        /* Redact API methods to scopes. Default scopes '*'... revisit */
        if (meta && meta.scopes) {
          const scopes = meta.scopes || ['*']
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
      }

      // set log context
      netlifyLogs.setContext(name)

      try {
        // https://github.com/netlify/cli-utils/blob/master/src/index.js#L40-L60
        const pluginReturnValue = await method({
          /* Netlify configuration file netlify.[toml|yml|json] */
          netlifyConfig: netlifyConfig,
          /* Plugin configuration */
          pluginConfig: config,
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
          error: error
        })
        console.log()
        console.timeEnd(name)
        if (pluginReturnValue) {
          return Promise.resolve(Object.assign({}, currentData, pluginReturnValue))
        }
      } catch (error) {
        console.log(chalk.redBright(`Error in ${name} plugin`))
        throw error
      }
    }
    return Promise.resolve(currentData)
  }, Promise.resolve({}))

  /* Clear logs prefix */
  netlifyLogs.reset()

  // console.log('returnData', returnData)
  return returnData
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
  if (process.env.DEPLOY_PRIME_URL) {
    return true
  }
  return false
}

// Expose Netlify config
module.exports.netlifyConfig = resolveConfig
// Expose Netlify config path getter
module.exports.getConfigFile = getConfigFile
