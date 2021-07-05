'use strict'

const { cleanupConfig, cleanupEnvironment } = require('./cleanup')
const { logObject, logSubHeader } = require('./logger')
const { cleanupConfigOpts } = require('./options')

// Log options in debug mode.
const logOpts = function (opts, { logs, debug, cachedConfig, cachedConfigPath }) {
  // In production, print those in the first call to `@netlify/config`, not the
  // second one done inside `@netlify/build`
  if (!debug || cachedConfig !== undefined || cachedConfigPath !== undefined) {
    return
  }

  logSubHeader(logs, 'Initial build environment')
  logObject(logs, cleanupConfigOpts(opts))
}

// Log `defaultConfig` option in debug mode
const logDefaultConfig = function (defaultConfig, { logs, debug, baseRelDir }) {
  if (!debug || defaultConfig === undefined) {
    return
  }

  logSubHeader(logs, 'UI build settings')
  logObject(logs, cleanupConfig({ ...defaultConfig, baseRelDir }))
}

// Log `inlineConfig` option in debug mode
const logInlineConfig = function (initialConfig, { logs, debug }) {
  if (!debug || Object.keys(initialConfig).length === 0) {
    return
  }

  logSubHeader(logs, 'Configuration override')
  logObject(logs, cleanupConfig(initialConfig))
}

// Log return value of `@netlify/config` in debug mode
const logResult = function ({ configPath, buildDir, config, context, branch, env }, { logs, debug }) {
  if (!debug) {
    return
  }

  logSubHeader(logs, 'Resolved build environment')
  logObject(logs, { configPath, buildDir, context, branch, env: cleanupEnvironment(env) })

  logSubHeader(logs, 'Resolved config')
  logObject(logs, cleanupConfig(config))
}

module.exports = { logOpts, logDefaultConfig, logInlineConfig, logResult }
