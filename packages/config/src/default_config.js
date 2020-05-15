const isPlainObj = require('is-plain-obj')

const { deepMerge } = require('./utils/merge')

// Merge `--defaultConfig` which is used to retrieve UI build settings and
// UI-installed plugins.
const mergeDefaultConfig = function(defaultConfig, config) {
  // No `--defaultConfig`
  if (!isPlainObj(defaultConfig)) {
    return config
  }

  const { plugins: defaultPlugins, ...defaultConfigA } = defaultConfig
  const { plugins, ...configA } = config

  const pluginsA = mergePlugins(defaultPlugins, plugins)
  const configB = deepMerge(defaultConfigA, configA)

  if (pluginsA === undefined) {
    return configB
  }

  return { ...configB, plugins: pluginsA }
}

// `defaultConfig` `plugins` are UI-installed plugins. Those are merged by
// concatenation instead of override.
// Also, we add the `origin` field of plugins: installed through `ui` or through
// `config` (`netlify.toml`)
const mergePlugins = function(defaultPlugins, plugins = []) {
  // Invalid `config.plugins`, validated in next step
  if (!Array.isArray(plugins) || !plugins.every(isPlainObj)) {
    return plugins
  }

  const pluginsA = plugins.map(addConfigOrigin)

  if (!Array.isArray(defaultPlugins)) {
    return pluginsA
  }

  return [...defaultPlugins.map(addUiOrigin), ...pluginsA]
}

const addConfigOrigin = function(plugin) {
  return { ...plugin, origin: 'config' }
}

const addUiOrigin = function(plugin) {
  return { ...plugin, origin: 'ui' }
}

module.exports = { mergeDefaultConfig }
