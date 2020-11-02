'use strict'

const { throwError } = require('./error')
const { addBuildCommandOrigins, addPluginsOrigins } = require('./origin')
const { deepMerge } = require('./utils/merge')

// Merge `--defaultConfig` which is used to retrieve UI build settings and
// UI-installed plugins.
// Also merge `inlineConfig` which is used for Netlify CLI flags.
const mergeConfigs = function (
  { plugins: defaultPlugins = [], ...defaultConfig },
  { plugins = [], ...config },
  { plugins: inlinePlugins = [], ...inlineConfig },
) {
  const [defaultConfigA, configA, inlineConfigA] = addBuildCommandOrigins(defaultConfig, config, inlineConfig)
  const configB = deepMerge(defaultConfigA, configA, inlineConfigA)
  const pluginsA = mergePlugins(defaultPlugins, plugins, inlinePlugins)
  return { ...configB, plugins: pluginsA }
}

// `defaultConfig` `plugins` are UI-installed plugins. Those are merged by
// concatenation instead of override.
// Also, we add the `origin` field of plugins: installed through `ui` or through
// `config` (`netlify.toml`)
const mergePlugins = function (defaultPlugins, plugins, inlinePlugins) {
  const [defaultPluginsA, pluginsA, inlinePluginsA] = addPluginsOrigins(defaultPlugins, plugins, inlinePlugins)
  const pluginsB = [...defaultPluginsA, ...pluginsA, ...inlinePluginsA].filter(isNotOverridenPlugin)
  return pluginsB
}

// When a plugin is specified both in the UI and netlify.toml, we only keep
// the netlify.toml one.
const isNotOverridenPlugin = function (plugin, index, plugins) {
  const overridingPlugin = plugins.slice(index + 1).find((pluginA) => plugin.package === pluginA.package)

  if (overridingPlugin !== undefined && overridingPlugin.origin === 'config' && plugin.origin === 'config') {
    throwError(`Plugin "${plugin.package}" must not be specified twice in netlify.toml`)
  }

  return overridingPlugin === undefined
}

module.exports = { mergeConfigs }
