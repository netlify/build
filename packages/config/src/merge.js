'use strict'

const { groupBy } = require('./utils/group')
const { mergeConfigs } = require('./utils/merge')

// Merge `--defaultConfig` which is used to retrieve UI build settings and
// UI-installed plugins.
// Also merge `inlineConfig` which is used for Netlify CLI flags.
// Context-specific plugins can only be specified in the `config`, so it ok to
// handle them later.
const mergeAllConfigs = function ([defaultConfig, config, inlineConfig]) {
  const plugins = mergePlugins([defaultConfig, config, inlineConfig])
  const configA = mergeConfigs([defaultConfig, config, inlineConfig])
  return { ...configA, plugins }
}

// TODO: move this logic to `deepMerge()` instead so it used during context
// merging, allowing context-specific plugins.
const mergePlugins = function (configs) {
  return configs.map(getPlugins).reduce(mergePluginsArrays, [])
}

const getPlugins = function ({ plugins = [] }) {
  return plugins
}

// Merge two `config.plugins`. Merge plugins with the same `plugin.package`.
const mergePluginsArrays = function (pluginsA, pluginsB) {
  const plugins = [...pluginsA, ...pluginsB]
  return groupBy(plugins, 'package').map(mergePluginConfigs)
}

const mergePluginConfigs = function (plugins) {
  return plugins.reduce(mergePluginsPair, {})
}

// TODO: use deep merging instead
const mergePluginsPair = function (pluginA, pluginB) {
  return { ...pluginA, ...pluginB }
}

module.exports = { mergeAllConfigs }
