const { removeFalsy } = require('../utils/remove_falsy')

const { cleanupConfig } = require('./cleanup')

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

// Use an allowlist to prevent printing confidential values.
const cleanupConfigOpts = function({
  config,
  cwd,
  context,
  branch,
  mode,
  repositoryRoot,
  siteId,
  baseRelDir,
  env = {},
}) {
  const envA = Object.keys(env)
  return removeFalsy({
    config,
    cwd,
    context,
    branch,
    mode,
    repositoryRoot,
    siteId,
    baseRelDir,
    ...removeEmptyArray(envA, 'env'),
  })
}

const removeEmptyArray = function(array, propName) {
  return array.length === 0 ? {} : { [propName]: array }
}

module.exports = { logOpts, logDefaultConfig, logResult }
