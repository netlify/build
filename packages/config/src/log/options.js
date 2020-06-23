const { removeFalsy } = require('../utils/remove_falsy')

const { removeEmptyArray } = require('./remove')

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

module.exports = { cleanupConfigOpts }
