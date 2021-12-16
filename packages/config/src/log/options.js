import { DEFAULT_FEATURE_FLAGS } from '../options/feature_flags.js'
import { removeEmptyArray } from '../simplify.js'
import { removeFalsy } from '../utils/remove_falsy.js'

// Use an allowlist to prevent printing confidential values.
export const cleanupConfigOpts = function ({
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
