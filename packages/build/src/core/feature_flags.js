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

const DEFAULT_FEATURE_FLAGS = {
  // When `true`, the Deploy preview commenting core plugin is enabled
  dpc: false,
}

module.exports = { normalizeFeatureFlags, DEFAULT_FEATURE_FLAGS }
