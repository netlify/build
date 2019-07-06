const path = require('path')
const minimist = require('minimist')
const deepLog = require('./src/utils/deeplog')
const netlifyConfig = require('./src/config')

const baseDir = path.join(__dirname, 'examples')
const netlifyConfigFile = path.join(baseDir, 'netlify.yml')
const cliFlags = minimist(process.argv.slice(2))

/* env vars */
process.env.SITE = 'https://site.com'

;(async function main () {
  /* Load config */
  let config = {}
  try {
    config = await netlifyConfig(netlifyConfigFile, cliFlags)
  } catch (err) {
    console.log('Config error', err)
  }
  console.log('Current config')
  deepLog(config)

  /* Parse plugins */
  const plugins = config.plugins || []
  const allPlugins = plugins.reduce((acc, curr) => {
    const name = Object.keys(curr)[0]
    const pluginConfig = curr[name] || {}
    let code
    try {
      // resolve file path
      console.log(`Loading plugin "${name}"`)
      // Resolves relative plugins and plugins from node_modules dir. TODO harden resolution
      const filePath = (!name.match(/^\./)) ? name : path.resolve(baseDir, name)
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

  // console.log('Build Lifecycle:')
  // deepLog(allPlugins)

  const lifecycle = [
    'init',
    'configParse',
    'getCache',
    'install',
    'build',
      // >
      // 'build:site'
      // 'build:function',
    'package',
    'deploy',
    'saveCache',
    'manifest',
    'finally'
  ]

  // Add pre & post hooks
  const fullLifecycle = lifecycle.reduce((acc, hook) => {
    acc = acc.concat([ preFix(hook), hook, postFix(hook) ])
    return acc
  }, [])
  // console.log('fullLifecycle', fullLifecycle)

  /* Get active build instructions */
  const buildInstructions = fullLifecycle.reduce((acc, n) => {
    if (allPlugins.lifeCycleHooks[n]) {
      acc = acc.concat(allPlugins.lifeCycleHooks[n])
    }
    return acc
  }, [])

  console.log('buildInstructions', buildInstructions)
  /* patch environment dependencies */

  /* Execute build with plugins */
  console.log()
  const manifest = await engine(buildInstructions, config)
  console.log('Build complete', manifest)
})()

function preFix(hook) {
  return `pre${hook}`
}

function postFix(hook) {
  return `post${hook}`
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
      console.log(`> ${i + 1}. Running "${hook}" lifecycle from "${name}" plugin`)
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
