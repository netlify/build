const groupBy = require('group-by')

const { logLoadPlugins, logLoadedPlugins } = require('../log/main')
const { addErrorInfo } = require('../error/info')

const { getPackageJson } = require('./package')
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
  buildDir,
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
        buildDir,
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
  { package, pluginPath, inputs, id, core, local },
  { childProcesses, index, netlifyConfig, utilsData, configPath, buildDir, token, siteInfo },
) {
  const { childProcess } = childProcesses[index]
  const packageJson = await getPackageJson({ pluginPath, local })

  try {
    const { pluginCommands } = await callChild(childProcess, 'load', {
      id,
      package,
      pluginPath,
      inputs,
      netlifyConfig,
      utilsData,
      configPath,
      core,
      local,
      buildDir,
      token,
      siteInfo,
      packageJson,
    })
    const pluginCommandsA = pluginCommands.map(pluginCommand => ({ ...pluginCommand, childProcess }))
    return pluginCommandsA
  } catch (error) {
    const idA = id === undefined ? package : id
    addErrorInfo(error, { plugin: { id: idA, packageJson }, location: { event: 'load', package, local } })
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
