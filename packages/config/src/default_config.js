const isPlainObj = require('is-plain-obj')

const { deepMerge } = require('./utils/merge')

// Merge `--defaultConfig` which is used to retrieve UI build settings and
// UI-installed plugins.
const mergeDefaultConfig = function(defaultConfig, { plugins = [], ...config }) {
  // No `--defaultConfig`
  if (!isPlainObj(defaultConfig)) {
    return { ...config, plugins }
  }

  const { plugins: defaultPlugins, ...defaultConfigA } = defaultConfig

  const configA = deepMerge(defaultConfigA, config)
  const pluginsA = mergePlugins(defaultPlugins, plugins)
  return { ...configA, plugins: pluginsA }
}

// `defaultConfig` `plugins` are UI-installed plugins. Those are merged by
// concatenation instead of override.
// Also, we add the `origin` field of plugins: installed through `ui` or through
// `config` (`netlify.toml`)
const mergePlugins = function(defaultPlugins, plugins) {
  // Invalid `config.plugins`, validated in next step
  // Or no `defaultConfig` `plugins`
  if (!Array.isArray(plugins) || !plugins.every(isPlainObj) || !Array.isArray(defaultPlugins)) {
    return plugins
  }

  return [...defaultPlugins.map(addUiOrigin), ...plugins]
}

const addUiOrigin = function(plugin) {
  return { ...plugin, origin: 'ui' }
}

module.exports = { mergeDefaultConfig }
