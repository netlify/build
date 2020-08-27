const { addPluginLoadErrorStatus } = require('../status/add')
const { measureDuration } = require('../time/main')

const { callChild } = require('./ipc')

// Retrieve all plugins commands
// Can use either a module name or a file path to the plugin.
const tLoadPlugins = async function({ pluginsOptions, childProcesses, netlifyConfig, constants, debug }) {
  const pluginsCommands = await Promise.all(
    pluginsOptions.map((pluginOptions, index) =>
      loadPlugin(pluginOptions, { childProcesses, index, netlifyConfig, constants, debug }),
    ),
  )
  const pluginsCommandsA = pluginsCommands.flat()
  return { pluginsCommands: pluginsCommandsA }
}

const loadPlugins = measureDuration(tLoadPlugins, 'load_plugins')

// Retrieve plugin commands for one plugin.
// Do it by executing the plugin `load` event handler.
const loadPlugin = async function(
  { package, pluginPackageJson, pluginPackageJson: { version } = {}, pluginPath, inputs, loadedFrom, origin },
  { childProcesses, index, netlifyConfig, constants, debug },
) {
  const { childProcess } = childProcesses[index]
  const event = 'load'
  const constantsA = cleanConstants(constants, loadedFrom)

  try {
    const { pluginCommands } = await callChild(
      childProcess,
      'load',
      { pluginPath, inputs, netlifyConfig, constants: constantsA },
      { plugin: { package, pluginPackageJson }, location: { event, package, loadedFrom, origin } },
    )
    const pluginCommandsA = pluginCommands.map(({ event }) => ({
      event,
      package,
      loadedFrom,
      origin,
      pluginPackageJson,
      childProcess,
    }))
    return pluginCommandsA
  } catch (error) {
    const errorA = addPluginLoadErrorStatus({ error, package, version, debug })
    throw errorA
  }
}

// Only core plugins can use `constants.NETLIFY_API_TOKEN` at the moment
const cleanConstants = function({ NETLIFY_API_TOKEN, ...constants }, loadedFrom) {
  if (loadedFrom !== 'core') {
    return constants
  }

  return { ...constants, NETLIFY_API_TOKEN }
}

module.exports = { loadPlugins }
