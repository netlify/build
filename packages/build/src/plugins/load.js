'use strict'

const { addErrorInfo } = require('../error/info')
const { addPluginLoadErrorStatus } = require('../status/load_error')
const { measureDuration } = require('../time/main')

const { callChild } = require('./ipc')

// Retrieve all plugins commands
// Can use either a module name or a file path to the plugin.
const loadPlugins = async function ({ pluginsOptions, childProcesses, packageJson, timers, debug }) {
  return pluginsOptions.length === 0
    ? { pluginsCommands: [], timers }
    : await loadAllPlugins({ pluginsOptions, childProcesses, packageJson, timers, debug })
}

const tLoadAllPlugins = async function ({ pluginsOptions, childProcesses, packageJson, debug }) {
  const pluginsCommands = await Promise.all(
    pluginsOptions.map((pluginOptions, index) =>
      loadPlugin(pluginOptions, { childProcesses, index, packageJson, debug }),
    ),
  )
  const pluginsCommandsA = pluginsCommands.flat()
  return { pluginsCommands: pluginsCommandsA }
}

// Only performed if there are some plugins
const loadAllPlugins = measureDuration(tLoadAllPlugins, 'load_plugins')

// Retrieve plugin commands for one plugin.
// Do it by executing the plugin `load` event handler.
const loadPlugin = async function (
  { packageName, pluginPackageJson, pluginPackageJson: { version } = {}, pluginPath, inputs, loadedFrom, origin },
  { childProcesses, index, packageJson, debug },
) {
  const { childProcess } = childProcesses[index]
  const loadEvent = 'load'

  try {
    const { pluginCommands } = await callChild(childProcess, 'load', { pluginPath, inputs, packageJson })
    const pluginCommandsA = pluginCommands.map(({ event }) => ({
      event,
      packageName,
      loadedFrom,
      origin,
      pluginPackageJson,
      childProcess,
    }))
    return pluginCommandsA
  } catch (error) {
    addErrorInfo(error, {
      plugin: { packageName, pluginPackageJson },
      location: { event: loadEvent, packageName, loadedFrom, origin },
    })
    addPluginLoadErrorStatus({ error, packageName, version, debug })
    throw error
  }
}

module.exports = { loadPlugins }
