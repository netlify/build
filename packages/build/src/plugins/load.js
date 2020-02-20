const groupBy = require('group-by')

const { logLoadPlugins, logLoadedPlugins } = require('../log/main')

const { isNotOverridden } = require('./override')
const { callChild } = require('./ipc')

// Retrieve all plugins commands
// Can use either a module name or a file path to the plugin.
const loadPlugins = async function({
  pluginsOptions,
  childProcesses,
  netlifyConfig,
  utilsData,
  configPath,
  baseDir,
  token,
  siteInfo,
}) {
  logLoadPlugins()

  const pluginCommands = await Promise.all(
    pluginsOptions.map((pluginOptions, index) =>
      loadPlugin(pluginOptions, {
        childProcesses,
        index,
        netlifyConfig,
        utilsData,
        configPath,
        baseDir,
        token,
        siteInfo,
      }),
    ),
  )
  const pluginCommandsA = pluginCommands.flat()

  logLoadedPlugins(pluginCommandsA)

  const pluginCommandsB = pluginCommandsA.filter(isNotDuplicate).filter(isNotOverridden)
  const pluginsCommandsC = groupBy(pluginCommandsB, 'event')
  return pluginsCommandsC
}

// Retrieve plugin commands for one plugin.
// Do it by executing the plugin `load` event handler.
const loadPlugin = async function(
  { package, pluginPath, pluginConfig, id, core, local },
  { childProcesses, index, netlifyConfig, utilsData, configPath, baseDir, token, siteInfo },
) {
  try {
    const { childProcess } = childProcesses[index]
    const { pluginCommands } = await callChild(childProcess, 'load', {
      id,
      package,
      pluginPath,
      pluginConfig,
      netlifyConfig,
      utilsData,
      configPath,
      core,
      local,
      baseDir,
      token,
      siteInfo,
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
