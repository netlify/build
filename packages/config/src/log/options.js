const { removeFalsy } = require('../utils/remove_falsy')

// Log options in debug mode.
const logOpts = function(opts, { debug }) {
  if (!debug) {
    return
  }

  const cleanedOpts = cleanupConfigOpts(opts)
  debugLogObject('options', cleanedOpts)
}

const debugLogObject = function(message, object) {
  const serializedObject = JSON.stringify(object, null, 2)
  console.warn(`@netlify/config ${message}\n${serializedObject}`)
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

module.exports = { logOpts }
