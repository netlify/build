'use strict'

const { extractFunctionsDirectory, normalize: normalizeFunctionsConfig } = require('./functions_config')
const { mergeConfigs } = require('./utils/merge')
const { removeFalsy } = require('./utils/remove_falsy')

const addFunctionsDirectory = ({ functionsDirectory, v1FunctionsDirectory }) => {
  if (functionsDirectory) {
    return {
      functionsDirectory,
      functionsDirectoryOrigin: 'config',
    }
  }

  if (v1FunctionsDirectory) {
    return {
      functionsDirectory: v1FunctionsDirectory,
      functionsDirectoryOrigin: 'config-v1',
    }
  }

  return {}
}

// Normalize configuration object
const normalizeConfig = function (config) {
  const { build, functions, plugins, ...configA } = mergeConfigs([DEFAULT_CONFIG, config])

  // Removing the legacy `functions` from the `build` block.
  const { functions: v1FunctionsDirectory, ...buildB } = build
  const functionsConfig = normalizeFunctionsConfig(functions)

  // Looking for a default directory in the `functions` block, separating it
  // from the rest of the configuration if it exists.
  const { directory: functionsDirectory, functions: functionsConfigA } = extractFunctionsDirectory(functionsConfig)
  const functionsProperties = addFunctionsDirectory({ functionsDirectory, v1FunctionsDirectory })
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
