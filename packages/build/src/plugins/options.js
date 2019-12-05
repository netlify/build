const {
  env: { NETLIFY_BUILD_SAVE_CACHE },
} = require('process')

const FUNCTIONS_PLUGIN = `${__dirname}/functions/index.js`
const CACHE_PLUGIN = `${__dirname}/../cache/plugin.js`

// Load plugin options (specified by user in `config.plugins`)
const getPluginsOptions = function({ config: { plugins: pluginsOptions } }) {
  return [...DEFAULT_PLUGINS, ...pluginsOptions].map(normalizePluginOptions).filter(isPluginEnabled)
}

const DEFAULT_PLUGINS = [
  { id: '@netlify/plugin-functions-core', type: FUNCTIONS_PLUGIN, core: true },
  ...(NETLIFY_BUILD_SAVE_CACHE === '1' ? [{ id: '@netlify/plugin-cache-core', type: CACHE_PLUGIN, core: true }] : []),
]

const normalizePluginOptions = function(pluginOptions) {
  const { id, type, core, enabled, config: pluginConfig } = {
    ...DEFAULT_PLUGIN_OPTIONS,
    ...pluginOptions,
  }
  return { id, type, core, enabled, pluginConfig }
}

const DEFAULT_PLUGIN_OPTIONS = { enabled: true, core: false, config: {} }

const isPluginEnabled = function({ enabled }) {
  return String(enabled) !== 'false'
}

module.exports = { getPluginsOptions }
