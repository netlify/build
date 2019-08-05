const path = require('path')
const minimist = require('minimist')
const chalk = require('chalk')
const execa = require('execa')
const deepLog = require('./utils/deeplog')
const netlifyConfig = require('./config')
const Conf = require('conf') // for simple kv store

const baseDir = process.cwd()
const cliFlags = minimist(process.argv.slice(2))
const netlifyConfigFile = cliFlags.config

/* env vars */
process.env.SITE = 'https://netlify.com'
// // TODO: enable this in production
// const NETLIFY_BUILD_BASE = '/opt/buildhome'
// // just for local dev
const NETLIFY_BUILD_BASE = '.'
const NETLIFY_CACHE_DIR = `${NETLIFY_BUILD_BASE}/cache`

;(async function main () {
  /* Load config */
  let config = {}
  try {
    config = await netlifyConfig(netlifyConfigFile, cliFlags)
  } catch (err) {
    console.log('Config error', err)
  }
  console.log(chalk.cyanBright.bold('Netlify Config'))
  deepLog(config)
  console.log()

  /* Parse plugins */
  const plugins = config.plugins || []
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
        filePath = path.resolve(baseDir, 'node_modules', name)
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


    // kvstore in `${NETLIFY_CACHE_DIR}/${name}.json`
    // we choose to let the user createStore instead of doing it for them
    // bc they may want to set `defaults` and `schema` and `de/serialize`
    const createStore = confOptions => new Conf({ 
      ...confOptions, 
      cwd: NETLIFY_CACHE_DIR,
      configName: name
    });

    const methods = (typeof code === 'function') ? code(pluginConfig, createStore) : code

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

  /* Get active build instructions */
  const buildInstructions = fullLifecycle.reduce((acc, n) => {
    /* Merge in config lifecycle events first */
    if (config.build.lifecycle[n]) {
      acc = acc.concat({
        name: `config.build.lifecycle.${n}`,
        hook: n,
        config: {},
        method: async () => {
          try {
            // Parse commands and turn into exec
            if (Array.isArray(config.build.lifecycle[n])) {
              const doCommands = config.build.lifecycle[n].map((cmd) => {
                return execCommand(cmd)
              })
              await Promise.all(doCommands)
            } else {
              const commands = config.build.lifecycle[n].split('\n')
              const doCommands = commands.map((cmd) => {
                if (!cmd) {
                  return Promise.resolve()
                }
                return execCommand(cmd)
              })
              await Promise.all(doCommands)
            }
          } catch (err) {
            console.log(chalk.redBright(`Error from netlify config build.lifecycle.${n} n from command:`))
            console.log(`"${config.build.lifecycle[n]}"`)
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
  const manifest = await engine(buildInstructions, config)
  console.log(chalk.greenBright.bold('Netlify Build complete'))
  console.log()
  if (Object.keys(manifest).length) {
    console.log('Manifest:')
    deepLog(manifest)
  }
})()

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
async function engine(methodsToRun, config) {
  const returnData = await methodsToRun.reduce(async (promiseChain, plugin, i) => {
    const { method, hook, config, name } = plugin
    const currentData = await promiseChain
    if (method && typeof method === 'function') {
      const source = (name.match(/^config\.build/)) ? 'via config' : 'plugin'
      console.log(chalk.cyanBright(`> ${i + 1}. Running "${hook}" lifecycle from "${name}" ${source}`))
      console.log()
      const pluginReturnValue = await method(config)
      console.log()
      if (pluginReturnValue) {
        return Promise.resolve(Object.assign({}, currentData, pluginReturnValue))
      }
    }
    return Promise.resolve(currentData)
  }, Promise.resolve({}))
  // console.log('returnData', returnData)
  return returnData
}
