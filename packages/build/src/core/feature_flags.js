'use strict'

const { env } = require('process')

// From CLI `--featureFlags=a,b,c` to programmatic `{ a: true, b: true, c: true }`
const normalizeCliFeatureFlags = function (cliFeatureFlags) {
  return Object.assign({}, ...cliFeatureFlags.split(',').filter(isNotEmpty).map(getFeatureFlag))
}

const isNotEmpty = function (name) {
  return name.trim() !== ''
}

const getFeatureFlag = function (name) {
  return { [name]: true }
}

// Default values for feature flags
const DEFAULT_FEATURE_FLAGS = {
  zisiEsbuildDynamicImports: env.NETLIFY_EXPERIMENTAL_PROCESS_DYNAMIC_IMPORTS === 'true',
  buildbot_build_plugins_system_node_version: false,
}

module.exports = { normalizeCliFeatureFlags, DEFAULT_FEATURE_FLAGS }
