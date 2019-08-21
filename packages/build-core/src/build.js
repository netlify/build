const os = require('os')
const path = require('path')
const chalk = require('chalk')
const execa = require('execa')
const makeDir = require('make-dir')
const deepLog = require('./utils/deeplog')
const getNetlifyConfig = require('./config')
const { toToml } = require('./config')
const { fileExists, readDir, writeFile } = require('./utils/fs')
const { zipFunctions } = require('@netlify/zip-it-and-ship-it')

const baseDir = process.cwd()

module.exports = async function build(configPath, cliFlags) {
  const netlifyConfigFilePath = configPath || cliFlags.config
  /* Load config */
  let netlifyConfig = {}
  try {
    netlifyConfig = await getNetlifyConfig(netlifyConfigFilePath, cliFlags)
  } catch (err) {
    console.log('Netlify Config Error')
    throw err
  }
  console.log(chalk.cyanBright.bold('Netlify Config'))
  deepLog(netlifyConfig)
  console.log()

  /* Parse plugins */
  const plugins = netlifyConfig.plugins || []
  const allPlugins = plugins.filter((plug) => {
    /* Load enabled plugins only */
    const name = Object.keys(plug)[0]
    const pluginConfig = plug[name] || {}
    return pluginConfig.enabled !== false && pluginConfig.enabled !== 'false'
  }).reduce((acc, curr) => {
    const name = Object.keys(curr)[0]
    const pluginConfig = curr[name] || {}
    let code
    try {
      // resolve file path
      // TODO harden resolution
      let filePath
      if (name.match(/^\./)) {
        filePath = path.resolve(baseDir, name)
      } else {
        // If module scoped add @ symbol prefix
        const formattedName = (name.match(/^netlify\//)) ? `@${name.replace(/^@/, '')}` : name
        filePath = path.resolve(baseDir, 'node_modules', formattedName)
      }
      console.log(chalk.yellow(`Loading plugin "${name}" from ${filePath}`))
      code = require(filePath)
    } catch (e) {
      console.log(`Error loading ${name} plugin`)
      console.log(e)
      // TODO If plugin not found, automatically try and install and retry here
    }

    if (typeof code !== 'object' && typeof code !== 'function') {
      throw new Error(`Plugin ${name} is malformed. Must be object or function`)
    }

    const methods = (typeof code === 'function') ? code(pluginConfig) : code

    // Map plugins methods in order for later execution
    Object.keys(methods).forEach((hook) => {
      if (!acc.lifeCycleHooks[hook]) {
        acc.lifeCycleHooks[hook] = []
      }
      acc.lifeCycleHooks[hook] = acc.lifeCycleHooks[hook].concat({
        name: name,
        hook: hook,
        config: pluginConfig,
        method: methods[hook]
      })
    })

    return acc
  }, {
    lifeCycleHooks: {}
  })

  if (!netlifyConfig.build) {
    throw new Error('No build settings found')
  }

  // console.log('Build Lifecycle:')
  // deepLog(allPlugins)

  const lifecycle = [
    /* Build initialization steps */
    'init',
    /* Parse netlify.toml and resolve any dynamic configuration include build image if specified */
    'configParse',
    /* Fetch previous build cache */
    'getCache',
    /* Install project dependancies */
    'install',
    /* Build the site & functions */
    'build', // 'build:site', 'build:function',
    'build:site',
    'build:function',
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

  // Add pre & post hooks
  const fullLifecycle = lifecycle.reduce((acc, hook) => {
    acc = acc.concat([
      preFix(hook),
      hook,
      postFix(hook)
    ])
    return acc
  }, [])
  // console.log('fullLifecycle', fullLifecycle)

  if (netlifyConfig.build &&
      netlifyConfig.build.lifecycle &&
      netlifyConfig.build.command
  ) {
    throw new Error(`build.command && build.lifecycle are both defined. Please move build.command to build.lifecycle.build`)
  }

  /* Get active build instructions */
  const buildInstructions = fullLifecycle.reduce((acc, n) => {
    // Support for old command. Add build.command to execution
    if (netlifyConfig.build.command && n === 'build') {
      acc = acc.concat({
        name: `config.build.command`,
        hook: 'build',
        config: {},
        method: async () => {
          try {
            await execCommand(netlifyConfig.build.command)
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
              const stdout = await execCommand(curr)
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

  if (cliFlags.dryRun) {
    console.log()
    console.log(chalk.cyanBright.bold('Netlify Build Steps'))
    console.log()
    buildInstructions.forEach((instruction, i) => {
      const { name, hook } = instruction
      const source = (name.match(/^config\.build/)) ? 'config' : 'plugin'
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
    const manifest = await engine(buildInstructions, netlifyConfig, netlifyConfigFilePath)
    console.log(chalk.greenBright.bold('Netlify Build complete'))
    console.log()
    if (Object.keys(manifest).length) {
      console.log('Manifest:')
      deepLog(manifest)
    }
  } catch (err) {
    console.log('Lifecycle error')
    console.log(err)
  }

  const IS_NETLIFY = isNetlifyCI()

  /* Function bundling logic.
     TODO: Move into plugin lifecycle
  */
  if (!netlifyConfig.build.functions) {
    console.log('No functions directory set. Skipping functions build step')
    return false
  }

  if (!await fileExists(netlifyConfig.build.functions)) {
    console.log(`Functions directory "${netlifyConfig.build.functions}" not found`)
    throw new Error('Functions Build cancelled')
  }

  const deployID = process.env.DEPLOY_ID || '12345'
  let tempFileDir = path.join(baseDir, '.netlify', 'functions')

  if (IS_NETLIFY) {
    tempFileDir = path.join(os.tmpdir(), `zisi-${deployID}`)
  }

  if (!await fileExists(tempFileDir)) {
    console.log(`Temp functions directory "${tempFileDir}" not found`)
    console.log(`Creating tmp dir`, tempFileDir)
    await makeDir(tempFileDir)
  }

  try {
    console.log('Zipping functions')
    await zipFunctions(netlifyConfig.build.functions, tempFileDir)
  } catch (err) {
    console.log('Functions bundling error')
    throw new Error(err)
  }
  console.log('Functions bundled!')
  const funcs = await readDir(tempFileDir)
  console.log(funcs)

  if (IS_NETLIFY) {
    const toml = toToml(netlifyConfig)
    const tomlPath = path.join(baseDir, 'netlify.toml')
    console.log()
    console.log('TOML output:')
    console.log()
    console.log(toml)
    await writeFile(tomlPath, toml)
    console.log(`TOML file written to ${tomlPath}`)
  }
}

function preFix(hook) {
  return `pre${hook}`
}

function postFix(hook) {
  return `post${hook}`
}

async function execCommand(cmd) {
  console.log(chalk.yellowBright(`Running "${cmd}"`))
  const subprocess = execa(`${cmd}`, { shell: true })
  subprocess.stdout.pipe(process.stdout)
  const { stdout } = await subprocess
  return stdout
}

/**
 * Plugin engine
 * @param  {Array} methodsToRun - Plugin functions to run
 * @param  {Object} config - Netlify config file values
 * @return {Object} updated config?
 */
async function engine(methodsToRun, netlifyConfig, netlifyConfigFilePath) {
  const returnData = await methodsToRun.reduce(async (promiseChain, plugin, i) => {
    const { method, hook, config, name } = plugin
    const currentData = await promiseChain
    if (method && typeof method === 'function') {
      const source = (name.match(/^config\.build/)) ? 'via config' : 'plugin'
      console.log(chalk.cyanBright(`> ${i + 1}. Running "${hook}" lifecycle from "${name}" ${source}`))
      console.log()
      const rootPath = path.resolve(path.dirname(netlifyConfigFilePath))

      try {
        const pluginReturnValue = await method({
          netlifyConfig,
          pluginConfig: config,
          context: {
            rootPath: rootPath,
            configPath: path.resolve(netlifyConfigFilePath),
          },
          constants: {
            CACHE_DIR: path.join(rootPath, '.netlify', 'cache'),
            BUILD_DIR: path.join(rootPath, '.netlify', 'build')
          }
        })
        console.log()
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
  // console.log('returnData', returnData)
  return returnData
}

// Test if inside netlify build context
function isNetlifyCI() {
  if (process.env.DEPLOY_PRIME_URL) {
    return true
  }
  return false
}
