const groupBy = require('group-by')

const { logLoadPlugins, logLoadPlugin } = require('../log/main')

const { isNotOverridden } = require('./override')
const { callChild } = require('./ipc')

// Retrieve all plugins commands
// Can use either a module name or a file path to the plugin.
const loadPlugins = async function({ pluginsOptions, childProcesses, netlifyConfig, configPath, baseDir, token }) {
  logLoadPlugins()

  const pluginCommands = await Promise.all(
    pluginsOptions.map((pluginOptions, index) =>
      loadPlugin(pluginOptions, { childProcesses, index, netlifyConfig, configPath, baseDir, token }),
    ),
  )
  const pluginCommandsA = pluginCommands
    .flat()
    .filter(isNotDuplicate)
    .filter(isNotOverridden)
  const pluginsCommandsB = groupBy(pluginCommandsA, 'event')
  return pluginsCommandsB
}

// Retrieve plugin commands for one plugin.
// Do it by executing the plugin `load` event handler.
const loadPlugin = async function(
  { package, pluginPath, pluginConfig, id, core },
  { childProcesses, index, netlifyConfig, configPath, baseDir, token },
) {
  logLoadPlugin(id, package, core)

  const { childProcess } = childProcesses[index]

  try {
    const { pluginCommands } = await callChild(childProcess, 'load', {
      id,
      package,
      pluginPath,
      pluginConfig,
      netlifyConfig,
      configPath,
      core,
      baseDir,
      token,
    })
    const pluginCommandsA = pluginCommands.map(pluginCommand => ({ ...pluginCommand, childProcess }))
    return pluginCommandsA
  } catch (error) {
    const idA = id === undefined ? package : id
    error.message = `Error loading "${idA}" plugin:\n${error.message}`
    error.cleanStack = true
    throw error
  }
}

// Remove plugin commands that are duplicates.
// This might happen when using plugin presets. This also allows users to
// override the configuration of specific plugins when using presets.
const isNotDuplicate = function(pluginCommand, index, pluginCommands) {
  return !pluginCommands
    .slice(index + 1)
    .some(
      laterPluginCommand =>
        laterPluginCommand.id === pluginCommand.id && laterPluginCommand.event === pluginCommand.event,
    )
}

module.exports = { loadPlugins }
