'use strict'

const { normalizeFunctionsProps, WILDCARD_ALL } = require('./functions_config')
const { mergeConfigs } = require('./utils/merge')
const { removeFalsy } = require('./utils/remove_falsy')

// Normalize configuration object
const normalizeConfig = function (config) {
  const { build, functions, plugins, ...configA } = mergeConfigs([DEFAULT_CONFIG, config])
  const { build: buildA, functions: functionsA, functionsDirectoryProps } = normalizeFunctionsProps(build, functions)
  const pluginsA = plugins.map(normalizePlugin)
  return { ...configA, build: buildA, functions: functionsA, plugins: pluginsA, ...functionsDirectoryProps }
}

const DEFAULT_CONFIG = {
  build: { environment: {} },
  functions: { [WILDCARD_ALL]: {} },
  plugins: [],
}

const normalizePlugin = function ({ package: packageName, inputs = {}, origin, ...plugin }) {
  return removeFalsy({ ...plugin, package: packageName, inputs, origin })
}

module.exports = { normalizeConfig }
