'use strict'

const { normalize: normalizeFunctionsConfig } = require('./functions_config')
const { deepMerge } = require('./utils/merge')
const { removeFalsy } = require('./utils/remove_falsy')

// Normalize configuration object
const normalizeConfig = function (config) {
  const { build, functions, plugins, ...configA } = deepMerge(DEFAULT_CONFIG, config)
  const { functions: legacyFunctionsDirectory, ...buildB } = build
  const functionsA = normalizeFunctionsConfig({ defaultDirectory: legacyFunctionsDirectory, functions })
  const pluginsA = plugins.map(normalizePlugin)

  return { ...configA, build: buildB, functions: functionsA, plugins: pluginsA }
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
