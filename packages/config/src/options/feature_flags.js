'use strict'

// From `--featureFlags=a,b,c` to `{ a: true, b: true, c: true }`
const normalizeFeatureFlags = function ({ featureFlags = '', ...rawFlags }) {
  const normalizedFeatureFlags = Object.assign({}, ...featureFlags.split(',').filter(isNotEmpty).map(getFeatureFlag))
  return { ...rawFlags, featureFlags: normalizedFeatureFlags }
}

const isNotEmpty = function (name) {
  return name.trim() !== ''
}

const getFeatureFlag = function (name) {
  return { [name]: true }
}

// Default values for feature flags
const DEFAULT_FEATURE_FLAGS = {
  netlify_config_default_publish: false,
}

module.exports = { normalizeFeatureFlags, DEFAULT_FEATURE_FLAGS }
