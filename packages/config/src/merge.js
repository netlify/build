'use strict'

const { throwError } = require('./error')
const { deepMerge } = require('./utils/merge')

// Merge `--defaultConfig` which is used to retrieve UI build settings and
// UI-installed plugins.
// Also merge `inlineConfig` which is used for Netlify CLI flags.
const mergeConfigs = function (defaultConfig, config, inlineConfig) {
  const plugins = mergePlugins([defaultConfig, config, inlineConfig])
  const configA = deepMerge(defaultConfig, config, inlineConfig)
  return { ...configA, plugins }
}

// `defaultConfig` `plugins` are UI-installed plugins. Those are merged by
// concatenation instead of override.
// Also, we add the `origin` field of plugins: installed through `ui` or through
// `config` (`netlify.toml`)
// Context-specific plugins can only be specified in the `config`, so it ok to
// handle them later.
const mergePlugins = function (configs) {
  return configs.flatMap(getPlugins).filter(isNotOverridenPlugin)
}

const getPlugins = function ({ plugins = [] }) {
  return plugins
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
