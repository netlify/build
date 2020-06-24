const { cleanupConfig } = require('./cleanup')
const { logObject, logSubHeader } = require('./logger')
const { cleanupConfigOpts } = require('./options')

// Log options in debug mode.
const logOpts = function(opts, { debug, cachedConfig }) {
  // In production, print those in the first call to `@netlify/config`, not the
  // second one done inside `@netlify/build`
  if (!debug || cachedConfig !== undefined) {
    return
  }

  logSubHeader('Initial build settings')
  logObject(cleanupConfigOpts(opts))
}

// Log `defaultConfig` option in debug mode
const logDefaultConfig = function(defaultConfig, debug) {
  if (!debug || defaultConfig === undefined) {
    return
  }

  logSubHeader('UI build settings')
  logObject(cleanupConfig(defaultConfig))
}

// Log return value of `@netlify/config` in debug mode
const logResult = function({ configPath, buildDir, config, context, branch }, debug) {
  if (!debug) {
    return
  }

  logSubHeader('Resolved build settings')
  logObject({ configPath, buildDir, context, branch })

  logSubHeader('Resolved config')
  logObject(cleanupConfig(config))
}

module.exports = { logOpts, logDefaultConfig, logResult }
