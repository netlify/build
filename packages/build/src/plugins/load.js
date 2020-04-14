const groupBy = require('group-by')

const { logLoadPlugins, logLoadedPlugins } = require('../log/main')

const { callChild } = require('./ipc')

// Retrieve all plugins commands
// Can use either a module name or a file path to the plugin.
const loadPlugins = async function({ pluginsOptions, childProcesses, netlifyConfig, utilsData, token, constants }) {
  logLoadPlugins()

  const pluginCommands = await Promise.all(
    pluginsOptions.map((pluginOptions, index) =>
      loadPlugin(pluginOptions, {
        childProcesses,
        index,
        netlifyConfig,
        utilsData,
        token,
        constants,
      }),
    ),
  )
  const pluginCommandsA = pluginCommands.flat()

  logLoadedPlugins(pluginCommandsA)

  const pluginsCommandsB = groupBy(pluginCommandsA, 'event')
  return pluginsCommandsB
}

// Retrieve plugin commands for one plugin.
// Do it by executing the plugin `load` event handler.
const loadPlugin = async function(
  { package, packageJson, pluginPath, manifest, inputs, core, local },
  { childProcesses, index, netlifyConfig, utilsData, token, constants },
) {
  const { childProcess } = childProcesses[index]

  const { pluginCommands } = await callChild(
    childProcess,
    'load',
    { pluginPath, manifest, inputs, netlifyConfig, utilsData, token, constants },
    { plugin: { package, packageJson }, location: { event: 'load', package, local } },
  )
  const pluginCommandsA = pluginCommands.map(pluginCommand => ({
    ...pluginCommand,
    package,
    core,
    local,
    packageJson,
    childProcess,
  }))
  return pluginCommandsA
}

module.exports = { loadPlugins }
