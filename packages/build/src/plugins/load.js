const { logLoadedPlugins } = require('../log/main')

const { callChild } = require('./ipc')

// Retrieve all plugins commands
// Can use either a module name or a file path to the plugin.
const loadPlugins = async function({ pluginsOptions, childProcesses, netlifyConfig, utilsData, token, constants }) {
  const pluginsCommands = await Promise.all(
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
  const pluginsCommandsA = pluginsCommands.flat()
  logLoadedPlugins(pluginsCommandsA)
  return pluginsCommandsA
}

// Retrieve plugin commands for one plugin.
// Do it by executing the plugin `load` event handler.
const loadPlugin = async function(
  { package, packageJson, pluginPath, manifest, inputs, local, core },
  { childProcesses, index, netlifyConfig, utilsData, token, constants },
) {
  const { childProcess } = childProcesses[index]

  const { pluginCommands } = await callChild(
    childProcess,
    'load',
    { pluginPath, manifest, inputs, netlifyConfig, utilsData, token, constants },
    { plugin: { package, packageJson }, location: { event: 'load', package, local } },
  )
  const pluginCommandsA = pluginCommands.map(({ event }) => ({
    event,
    package,
    local,
    core,
    packageJson,
    childProcess,
  }))
  return pluginCommandsA
}

module.exports = { loadPlugins }
