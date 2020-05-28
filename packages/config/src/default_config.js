const { throwError } = require('./error')
const { deepMerge } = require('./utils/merge')

// Merge `--defaultConfig` which is used to retrieve UI build settings and
// UI-installed plugins.
const mergeDefaultConfig = function({ plugins: defaultPlugins = [], ...defaultConfig }, { plugins = [], ...config }) {
  const configA = deepMerge(defaultConfig, config)
  const pluginsA = mergePlugins(defaultPlugins, plugins)
  return { ...configA, plugins: pluginsA }
}

// `defaultConfig` `plugins` are UI-installed plugins. Those are merged by
// concatenation instead of override.
// Also, we add the `origin` field of plugins: installed through `ui` or through
// `config` (`netlify.toml`)
const mergePlugins = function(defaultPlugins, plugins) {
  const pluginsA = [...defaultPlugins.map(addUiOrigin), ...plugins.map(addConfigOrigin)]
  const pluginsB = pluginsA.filter(isNotOverridenPlugin)
  return pluginsB
}

const addUiOrigin = function(plugin) {
  return { ...plugin, origin: 'ui' }
}

const addConfigOrigin = function(plugin) {
  return { ...plugin, origin: 'config' }
}

// When a plugin is specified both in the UI and netlify.toml, we only keep
// the netlify.toml one.
const isNotOverridenPlugin = function(plugin, index, plugins) {
  const overridingPlugin = plugins.slice(index + 1).find(({ package }) => plugin.package === package)

  if (overridingPlugin !== undefined && overridingPlugin.origin === 'config' && plugin.origin === 'config') {
    throwError(`Plugin "${plugin.package}" must not be specified twice in netlify.toml`)
  }

  return overridingPlugin === undefined
}

module.exports = { mergeDefaultConfig }
