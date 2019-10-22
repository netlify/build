const DEFAULT_PLUGINS_DIR = __dirname

// Load plugin options (specified by user in `config.plugins`)
const getPluginsOptions = function({ config: { plugins: pluginsOptions } }) {
  // Temporary warning for malformed plugin block in config
  if (!Array.isArray(pluginsOptions)) {
    console.log(`
┌────────────────────────────────┐
│  Hello Beta Testers!!!!!!!!    │
└────────────────────────────────┘

 Plugins have been changed from an object to an array!

 Please update your plugins block to an array

 plugins:
   - type: ./plugin/path
     config:
       foo: bar
   - type: npm-module-path
     config:
       fizz: pop


 See more information in the docs http://bit.ly/31z46mF

─────────────────────────────────────────────
`)
  }
  return [...DEFAULT_PLUGINS, ...pluginsOptions].map(normalizePluginOptions).filter(isPluginEnabled)
}

const DEFAULT_PLUGINS = [
  { id: '@netlify/plugin-functions-core', type: `${DEFAULT_PLUGINS_DIR}/functions/index.js`, core: true },
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
