const DEFAULT_PLUGINS_DIR = __dirname

// Load plugin options (specified by user in `config.plugins`)
const getPluginsOptions = function({ config: { plugins: pluginsOptions } }) {
  const pluginsOptionsA = Object.assign({}, DEFAULT_PLUGINS, pluginsOptions)
  return Object.entries(pluginsOptionsA)
    .map(normalizePluginOptions)
    .filter(isPluginEnabled)
}

const DEFAULT_PLUGINS = {
  '@netlify/functions': { type: `${DEFAULT_PLUGINS_DIR}/functions/index.js`, core: true }
}

const normalizePluginOptions = function([pluginId, pluginOptions]) {
  const { type, core, enabled, config: pluginConfig } = Object.assign({}, DEFAULT_PLUGIN_OPTIONS, pluginOptions)
  return { pluginId, type, core, enabled, pluginConfig }
}

const DEFAULT_PLUGIN_OPTIONS = { enabled: true, core: false, config: {} }

const isPluginEnabled = function({ enabled }) {
  return String(enabled) !== 'false'
}

module.exports = { getPluginsOptions }
