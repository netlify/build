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
  logTitledObject('Initial build settings', cleanedOpts)
}

// Log `defaultConfig` option in debug mode
const logDefaultConfig = function(defaultConfig, debug) {
  if (!debug || defaultConfig === undefined) {
    return
  }

  const cleanedConfig = cleanupConfig(defaultConfig)
  logTitledObject('UI build settings', cleanedConfig)
}

// Log return value of `@netlify/config` in debug mode
const logResult = function({ configPath, buildDir, config, context, branch }, debug) {
  if (!debug) {
    return
  }

  logTitledObject('Resolved build settings', { configPath, buildDir, context, branch })
  logTitledObject('Resolved config', cleanupConfig(config))
}

const logTitledObject = function(message, object) {
  log(message)
  logObject(object)
  log('')
}

module.exports = { logOpts, logDefaultConfig, logResult }
