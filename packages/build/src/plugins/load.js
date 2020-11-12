'use strict'

const { addErrorInfo } = require('../error/info')
const { addPluginLoadErrorStatus } = require('../status/load_error')
const { measureDuration } = require('../time/main')

const { callChild } = require('./ipc')

// Retrieve all plugins commands
// Can use either a module name or a file path to the plugin.
const tLoadPlugins = async function ({ pluginsOptions, childProcesses, netlifyConfig, packageJson, debug }) {
  const pluginsCommands = await Promise.all(
    pluginsOptions.map((pluginOptions, index) =>
      loadPlugin(pluginOptions, { childProcesses, index, netlifyConfig, packageJson, debug }),
    ),
  )
  const pluginsCommandsA = pluginsCommands.flat()
  return { pluginsCommands: pluginsCommandsA }
}

const loadPlugins = measureDuration(tLoadPlugins, 'load_plugins')

// Retrieve plugin commands for one plugin.
// Do it by executing the plugin `load` event handler.
const loadPlugin = async function (
  { packageName, pluginPackageJson, pluginPackageJson: { version } = {}, pluginPath, inputs, loadedFrom, origin },
  { childProcesses, index, netlifyConfig, packageJson, debug },
) {
  const { childProcess } = childProcesses[index]
  const loadEvent = 'load'

  try {
    const { pluginCommands } = await callChild(childProcess, 'load', { pluginPath, inputs, netlifyConfig, packageJson })
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
