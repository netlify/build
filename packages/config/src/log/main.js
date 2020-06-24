const { cleanupConfig } = require('./cleanup')
const { log, logObject } = require('./logger')
const { cleanupConfigOpts } = require('./options')

// Log options in debug mode.
const logOpts = function(opts, { debug, cachedConfig }) {
  // In production, print those in the first call to `@netlify/config`, not the
  // second one done inside `@netlify/build`
  if (!debug || cachedConfig !== undefined) {
    return
  }

  const cleanedOpts = cleanupConfigOpts(opts)
  logTitledObject('@netlify/config options', cleanedOpts)
}

// Log `defaultConfig` option in debug mode
const logDefaultConfig = function(defaultConfig, debug) {
  if (!debug || defaultConfig === undefined) {
    return
  }

  const cleanedConfig = cleanupConfig(defaultConfig)
  logTitledObject('@netlify/config defaultConfig', cleanedConfig)
}

// Log return value of `@netlify/config` in debug mode
const logResult = function({ configPath, buildDir, config, context, branch }, debug) {
  if (!debug) {
    return
  }

  const configA = cleanupConfig(config)
  const resultA = { configPath, buildDir, config: configA, context, branch }
  logTitledObject('@netlify/config result', resultA)
}

const logTitledObject = function(message, object) {
  log(message)
  logObject(object)
  log('')
}

module.exports = { logOpts, logDefaultConfig, logResult }
