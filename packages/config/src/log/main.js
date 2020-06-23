const { cleanupConfig } = require('./cleanup')
const { cleanupConfigOpts } = require('./options')

// Log options in debug mode.
const logOpts = function(opts, { debug }) {
  if (!debug) {
    return
  }

  const cleanedOpts = cleanupConfigOpts(opts)
  debugLogObject('options', cleanedOpts)
}

// Log `defaultConfig` option in debug mode
const logDefaultConfig = function(defaultConfig, debug) {
  if (!debug || defaultConfig === undefined) {
    return
  }

  const cleanedConfig = cleanupConfig(defaultConfig)
  debugLogObject('defaultConfig', cleanedConfig)
}

// Log return value of `@netlify/config` in debug mode
const logResult = function({ configPath, buildDir, config, context, branch }, debug) {
  if (!debug) {
    return
  }

  const configA = cleanupConfig(config)
  const resultA = { configPath, buildDir, config: configA, context, branch }
  debugLogObject('result', resultA)
}

const debugLogObject = function(message, object) {
  const serializedObject = JSON.stringify(object, null, 2)
  console.warn(`@netlify/config ${message}\n${serializedObject}\n`)
}

module.exports = { logOpts, logDefaultConfig, logResult }
