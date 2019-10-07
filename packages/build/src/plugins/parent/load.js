const groupBy = require('group-by')

const { logLoadPlugins, logLoadPlugin } = require('../../log/main')
const { sendEventToChild, getEventFromChild } = require('../ipc.js')
const { isNotOverridden } = require('../override')

// Retrieve plugin hooks
// Can use either a module name or a file path to the plugin.
const loadPlugins = async function({
  pluginsOptions,
  childProcesses,
  config,
  configPath,
  baseDir,
  redactedKeys,
  token
}) {
  logLoadPlugins()

  const hooks = await Promise.all(
    pluginsOptions.map(pluginOptions =>
      loadPlugin(pluginOptions, { childProcesses, config, configPath, baseDir, redactedKeys, token })
    )
  )
  const hooksA = hooks.flat().filter(isNotOverridden)
  const pluginsHooks = groupBy(hooksA, 'hook')
  return pluginsHooks
}

const loadPlugin = async function(
  { type, pluginConfig, pluginId, core },
  { childProcesses, config, configPath, baseDir, redactedKeys, token }
) {
  logLoadPlugin(pluginId, type, core)

  const childProcess = childProcesses[pluginId]

  try {
    await sendEventToChild(childProcess, 'load', {
      pluginId,
      pluginConfig,
      type,
      config,
      configPath,
      baseDir,
      token
    })
    const { payload: hooks } = await getEventFromChild(childProcess, 'load')
    return hooks
  } catch (error) {
    error.message = `Error loading '${pluginId}' plugin:\n${error.message}`
    throw error
  }
}

module.exports = { loadPlugins }
