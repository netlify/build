'use strict'

const { DEFAULT_FEATURE_FLAGS } = require('../options/feature_flags')
const { removeFalsy } = require('../utils/remove_falsy')

const { removeEmptyArray } = require('./remove')

// Use an allowlist to prevent printing confidential values.
const cleanupConfigOpts = function ({
  config,
  cwd,
  context,
  branch,
  mode,
  repositoryRoot,
  siteId,
  baseRelDir,
  env = {},
  featureFlags = {},
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
    featureFlags: cleanFeatureFlags(featureFlags),
  })
}

// We only show feature flags related to `@netlify/config`.
// Also, we only print enabled feature flags.
const cleanFeatureFlags = function (featureFlags) {
  return Object.entries(featureFlags)
    .filter(shouldPrintFeatureFlag)
    .map(([featureFlagName]) => featureFlagName)
}

const shouldPrintFeatureFlag = function ([featureFlagName, enabled]) {
  return enabled && featureFlagName in DEFAULT_FEATURE_FLAGS
}

module.exports = { cleanupConfigOpts }
