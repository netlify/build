const groupBy = require('group-by')

const { logLoadPlugins, logLoadedPlugins } = require('../log/main')
const { addErrorInfo } = require('../error/info')

const { getPackageJson } = require('./package')
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

  const pluginsCommandsB = groupBy(pluginCommandsA, 'event')
  return pluginsCommandsB
}

// Retrieve plugin commands for one plugin.
// Do it by executing the plugin `load` event handler.
const loadPlugin = async function(
  { package, pluginPath, inputs, core, local },
  { childProcesses, index, netlifyConfig, utilsData, configPath, buildDir, token, siteInfo },
) {
  const { childProcess } = childProcesses[index]
  const packageJson = await getPackageJson({ pluginPath, local })

  try {
    const { pluginCommands } = await callChild(childProcess, 'load', {
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
    addErrorInfo(error, { plugin: { package, packageJson }, location: { event: 'load', package, local } })
    throw error
  }
}

module.exports = { loadPlugins }
