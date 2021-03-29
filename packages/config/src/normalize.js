'use strict'

const { extractFunctionsDirectory, normalize: normalizeFunctionsConfig } = require('./functions_config')
const { deepMerge } = require('./utils/merge')
const { removeFalsy } = require('./utils/remove_falsy')

// Normalize configuration object
const normalizeConfig = function (config) {
  const { build, functions, plugins, ...configA } = deepMerge(DEFAULT_CONFIG, config)

  // Removing the legacy `functions` from the `build` block.
  const { functions: legacyFunctionsDirectory, ...buildB } = build
  const functionsConfig = normalizeFunctionsConfig(functions)

  // Looking for a default directory in the `functions` block, separating it
  // from the rest of the configuration if it exists.
  const { directory: newFunctionsDirectory, functions: functionsConfigA } = extractFunctionsDirectory(functionsConfig)
  const functionsDirectory = newFunctionsDirectory || legacyFunctionsDirectory
  const functionsProperties = functionsDirectory ? { functionsDirectory, functionsDirectoryOrigin: 'config' } : {}
  const pluginsA = plugins.map(normalizePlugin)

  return { ...configA, build: buildB, functions: functionsConfigA, plugins: pluginsA, ...functionsProperties }
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
