const groupBy = require('group-by')

const { logLoadPlugins, logLoadPlugin } = require('../log/main')

const { isNotOverridden } = require('./override')
const { executePlugin } = require('./ipc')

// Retrieve plugin hooks for all plugins
// Can use either a module name or a file path to the plugin.
const loadPlugins = async function({ pluginsOptions, config, configPath, baseDir, redactedKeys, token }) {
  logLoadPlugins()

  const hooks = await Promise.all(
    pluginsOptions.map(pluginOptions => loadPlugin(pluginOptions, { config, configPath, baseDir, redactedKeys, token }))
  )
  const hooksA = hooks.flat().filter(isNotOverridden)
  const pluginsHooks = groupBy(hooksA, 'hook')
  return pluginsHooks
}

// Retrieve plugin hooks for one plugin.
// Do it by executing the plugin `load` event handler.
const loadPlugin = async function(
  { type, pluginConfig, pluginId, core },
  { config, configPath, baseDir, redactedKeys, token }
) {
  logLoadPlugin(pluginId, type, core)

  try {
    const { response: hooks } = await executePlugin(
      'load',
      { pluginId, type, baseDir, pluginConfig, configPath, config, core },
      { baseDir, redactedKeys }
    )
    return hooks
  } catch (error) {
    error.message = `Error loading '${pluginId}' plugin:\n${error.message}`
    throw error
  }
}

module.exports = { loadPlugins }
