'use strict'

const { env } = require('process')

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
  zisiHandlerV2: env.NETLIFY_EXPERIMENTAL_FUNCTION_HANDLER_V2 === 'true',
  buildbot_build_distribution_metrics: false,
}

module.exports = { normalizeFeatureFlags, DEFAULT_FEATURE_FLAGS }
