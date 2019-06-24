const path = require('path')
const minimist = require('minimist')
const deepLog = require('./src/utils/deeplog')
const netlifyConfig = require('./src/config')

const netlifyConfigFile = path.join(__dirname, 'netlify.yml')
const cliFlags = minimist(process.argv.slice(2))

/* env vars */
process.env.SITE = 'https://site.com'
process.env.MY_VAR_DEFAULT = 'default value'
process.env.MY_VAR_PROD = 'prod value'
process.env.MY_VAR_QA = 'qa value'
process.env.MY_VAR_DEV = 'dev value'

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

      code = require(name)
      // console.log('code', code)
    } catch (e) {
      console.log(`Error loading ${name} plugin`)
      console.log(e)
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

  console.log('Build Lifecycle:')
  deepLog(allPlugins)

  const lifecycle = [
    'init',
    'configParse',
    'getCache',
    'install',
    'build',
    'postBuild', // todo figure out pre/post setup
    'package',
    'deploy',
    'saveCache',
    'manifest',
    'finally'
  ]

  /* Get active build instructions */
  const buildInstructions = lifecycle.reduce((acc, n) => {
    if (allPlugins.lifeCycleHooks[n]) {
      acc = acc.concat(allPlugins.lifeCycleHooks[n])
    }
    return acc
  }, [])

  /* patch environment dependencies */

  /* Execute build with plugins */
  await engine(buildInstructions, config)
  console.log('done')
})()

async function engine(methodsToRun, config) {
  const returnData = await methodsToRun.reduce(async (promiseChain, plugin, i) => {
    const { method, hook, config, name } = plugin
    console.log(`Running lifeCycleHooks "${name}" "${hook}"`)
    const currentData = await promiseChain
    if (method && typeof method === 'function') {
      const pluginReturnValue = await method(config)
      if (pluginReturnValue) {
        return Promise.resolve(Object.assign({}, currentData, pluginReturnValue))
      }
    }
    return Promise.resolve(currentData)
  }, Promise.resolve({}))
  // console.log('returnData', returnData)
  return returnData
}
