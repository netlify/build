const { reportPluginLoadError } = require('../status/report')

const { callChild } = require('./ipc')

// Retrieve all plugins commands
// Can use either a module name or a file path to the plugin.
const loadPlugins = async function({
  pluginsOptions,
  childProcesses,
  netlifyConfig,
  constants,
  mode,
  api,
  errorMonitor,
  deployId,
  logs,
  testOpts,
}) {
  const pluginsCommands = await Promise.all(
    pluginsOptions.map((pluginOptions, index) =>
      loadPlugin(pluginOptions, {
        childProcesses,
        index,
        netlifyConfig,
        constants,
        mode,
        api,
        errorMonitor,
        deployId,
        logs,
        testOpts,
      }),
    ),
  )
  const pluginsCommandsA = pluginsCommands.flat()
  return pluginsCommandsA
}

// Retrieve plugin commands for one plugin.
// Do it by executing the plugin `load` event handler.
const loadPlugin = async function(
  { package, pluginPackageJson, pluginPackageJson: { version } = {}, pluginPath, inputs, loadedFrom, origin },
  { childProcesses, index, netlifyConfig, constants, mode, api, errorMonitor, deployId, logs, testOpts },
) {
  const { childProcess } = childProcesses[index]
  const event = 'load'

  try {
    const { pluginCommands } = await callChild(
      childProcess,
      'load',
      { pluginPath, inputs, netlifyConfig, constants },
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
    await reportPluginLoadError({
      error,
      api,
      mode,
      event,
      package,
      version,
      netlifyConfig,
      errorMonitor,
      deployId,
      logs,
      testOpts,
    })
    throw error
  }
}

module.exports = { loadPlugins }
