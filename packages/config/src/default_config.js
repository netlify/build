const { deepMerge } = require('./utils/merge')

// Merge `--defaultConfig` which is used to retrieve UI build settings and
// UI-installed plugins.
// `defaultConfig` `plugins` are UI-installed plugins. Those are merged by
// concatenation instead of override.
// Also, we add the `origin` field of plugins: installed through `ui` or through
// `config` (`netlify.toml`)
const mergeDefaultConfig = function({ plugins: defaultPlugins = [], ...defaultConfig }, { plugins = [], ...config }) {
  const configA = deepMerge(defaultConfig, config)
  const pluginsA = [...defaultPlugins.map(addUiOrigin), ...plugins]
  return { ...configA, plugins: pluginsA }
}

const addUiOrigin = function(plugin) {
  return { ...plugin, origin: 'ui' }
}

module.exports = { mergeDefaultConfig }
