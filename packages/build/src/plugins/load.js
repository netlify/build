const groupBy = require('group-by')

const { logLoadPlugins, logLoadPlugin } = require('../log/main')

const { isNotOverridden } = require('./override')
const { callChild } = require('./ipc')

// Retrieve plugin hooks for all plugins
// Can use either a module name or a file path to the plugin.
const loadPlugins = async function({ pluginsOptions, childProcesses, config, configPath, baseDir, token }) {
  logLoadPlugins()

  const hooks = await Promise.all(
    pluginsOptions.map((pluginOptions, index) =>
      loadPlugin(pluginOptions, { childProcesses, index, config, configPath, baseDir, token }),
    ),
  )
  const hooksA = hooks
    .flat()
    .filter(isNotDuplicate)
    .filter(isNotOverridden)
  const pluginsHooks = groupBy(hooksA, 'hook')
  return pluginsHooks
}

// Retrieve plugin hooks for one plugin.
// Do it by executing the plugin `load` event handler.
const loadPlugin = async function(
  { type, pluginPath, pluginConfig, id, core },
  { childProcesses, index, config, configPath, baseDir, token },
) {
  logLoadPlugin(id, type, core)

  const { childProcess } = childProcesses[index]

  try {
    const { hooks } = await callChild(childProcess, 'load', {
      id,
      type,
      pluginPath,
      pluginConfig,
      config,
      configPath,
      core,
      baseDir,
      token,
    })
    const hooksA = hooks.map(hook => ({ ...hook, childProcess }))
    return hooksA
  } catch (error) {
    const idA = id === undefined ? type : id
    error.message = `Error loading "${idA}" plugin:\n${error.message}`
    error.cleanStack = true
    throw error
  }
}

// Remove plugin hooks that are duplicates.
// This might happen when using plugin presets. This also allows users to
// override the configuration of specific plugins when using presets.
const isNotDuplicate = function(pluginHook, index, pluginHooks) {
  return !pluginHooks
    .slice(index + 1)
    .some(laterPluginHook => laterPluginHook.id === pluginHook.id && laterPluginHook.hook === pluginHook.hook)
}

module.exports = { loadPlugins }
