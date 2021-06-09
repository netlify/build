'use strict'

const { normalizeFunctionsProps, WILDCARD_ALL } = require('./functions_config')
const { mergeConfigs } = require('./utils/merge')
const { removeFalsy } = require('./utils/remove_falsy')

// Normalize configuration object
const normalizeConfig = function (config, featureFlags) {
  const defaultConfig = featureFlags.netlify_config_default_publish ? DEFAULT_CONFIG : NO_PUBLISH_DEFAULT_CONFIG
  const { build, functions, plugins, ...configA } = mergeConfigs([defaultConfig, config])
  const { build: buildA, functions: functionsA, functionsDirectoryProps } = normalizeFunctionsProps(build, functions)
  const pluginsA = plugins.map(normalizePlugin)
  return { ...configA, build: buildA, functions: functionsA, plugins: pluginsA, ...functionsDirectoryProps }
}

const NO_PUBLISH_DEFAULT_CONFIG = {
  build: { environment: {} },
  functions: { [WILDCARD_ALL]: {} },
  plugins: [],
}

const DEFAULT_CONFIG = {
  ...NO_PUBLISH_DEFAULT_CONFIG,
  build: { ...NO_PUBLISH_DEFAULT_CONFIG.build, publish: '.' },
}

const normalizePlugin = function ({ package: packageName, inputs = {}, origin, ...plugin }) {
  return removeFalsy({ ...plugin, package: packageName, inputs, origin })
}

module.exports = { normalizeConfig }
