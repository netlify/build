const { cleanupConfig } = require('./cleanup')
const { cleanupConfigOpts } = require('./options')

// Log options in debug mode.
const logOpts = function(opts, { debug, cachedConfig }) {
  // In production, print those in the first call to `@netlify/config`, not the
  // second one done inside `@netlify/build`
  if (!debug || cachedConfig !== undefined) {
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
  logWarning(`@netlify/config ${message}\n${serializedObject}\n`)
}

// Printed on stderr because stdout is reserved for the JSON output
const logWarning = function(string) {
  const stringA = string.replace(EMPTY_LINES_REGEXP, EMPTY_LINE)
  console.warn(stringA)
}

// We need to add a zero width space character in empty lines. Otherwise the
// buildbot removes those due to a bug: https://github.com/netlify/buildbot/issues/595
const EMPTY_LINES_REGEXP = /^\s*$/gm
const EMPTY_LINE = '\u{200b}'

module.exports = { logOpts, logDefaultConfig, logResult }
