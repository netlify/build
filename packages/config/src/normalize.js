'use strict'

const {
  normalize: normalizeFunctionsConfig,
  WILDCARD_ALL: FUNCTIONS_CONFIG_WILDCARD_ALL,
} = require('./functions_config')
const { deepMerge } = require('./utils/merge')
const { removeFalsy } = require('./utils/remove_falsy')

// Normalize configuration object
const normalizeConfig = function (config) {
  const { build, functions, plugins, ...configA } = deepMerge(DEFAULT_CONFIG, config)
  const functionsA = normalizeFunctionsConfig(functions)
  const topLevelFunctions = functionsA[FUNCTIONS_CONFIG_WILDCARD_ALL] || {}
  const buildA = {
    ...build,
    functions: topLevelFunctions.directory || build.functions,
  }
  const pluginsA = plugins.map(normalizePlugin)

  return { ...configA, build: buildA, functions: functionsA, plugins: pluginsA }
}

const DEFAULT_CONFIG = {
  build: { environment: {} },
  functions: {},
  plugins: [],
}

const normalizePlugin = function ({ package: packageName, inputs = {}, origin, ...plugin }) {
  return removeFalsy({ ...plugin, package: packageName, inputs, origin })
}

module.exports = { normalizeConfig }
