const { isDirectory } = require('path-type')

const { LOCAL_INSTALL_PLUGIN_NAME } = require('../install/local')

const FUNCTIONS_INSTALL_PLUGIN = `${__dirname}/functions_install/plugin.js`
const FUNCTIONS_PLUGIN = `${__dirname}/functions/plugin.js`

// List of core plugin names
const FUNCTIONS_PLUGIN_NAME = '@netlify/plugin-functions-core'
const FUNCTIONS_INSTALL_PLUGIN_NAME = '@netlify/plugin-functions-install-core'
const EDGE_HANDLERS_PLUGIN_NAME = '@netlify/plugin-edge-handlers'
const CORE_PLUGINS = [
  FUNCTIONS_PLUGIN_NAME,
  FUNCTIONS_INSTALL_PLUGIN_NAME,
  LOCAL_INSTALL_PLUGIN_NAME,
  EDGE_HANDLERS_PLUGIN_NAME,
]

const EDGE_HANDLERS_PLUGIN_PATH = require.resolve(EDGE_HANDLERS_PLUGIN_NAME)

// Plugins that are installed and enabled by default
const getCorePlugins = async function({ constants: { FUNCTIONS_SRC }, buildDir, plugins }) {
  const functionsPlugin = getFunctionsPlugin(FUNCTIONS_SRC)
  const functionsInstallPlugin = getFunctionsInstallPlugin(FUNCTIONS_SRC)
  const edgeHandlersPlugin = await getEdgeHandlersPlugin({ buildDir, plugins })
  return [functionsPlugin, functionsInstallPlugin, edgeHandlersPlugin].filter(Boolean)
}

// When no "Functions directory" is defined, it means users does not use
// Netlify Functions.
// However when it is defined but points to a non-existing directory, this
// might mean the directory is created later one, so we cannot do that check
// yet.
const getFunctionsPlugin = function(FUNCTIONS_SRC) {
  if (FUNCTIONS_SRC === undefined) {
    return
  }

  return { package: FUNCTIONS_PLUGIN_NAME, pluginPath: FUNCTIONS_PLUGIN }
}

const getFunctionsInstallPlugin = function(FUNCTIONS_SRC) {
  if (FUNCTIONS_SRC === undefined) {
    return
  }

  return { package: FUNCTIONS_INSTALL_PLUGIN_NAME, pluginPath: FUNCTIONS_INSTALL_PLUGIN, optional: true }
}

const getEdgeHandlersPlugin = async function({ buildDir, plugins }) {
  if (!(await usesEdgeHandlers({ buildDir, plugins }))) {
    return
  }

  return { package: EDGE_HANDLERS_PLUGIN_NAME, pluginPath: EDGE_HANDLERS_PLUGIN_PATH }
}

// To enable Edge handlers, either:
//   - create a `edge-handlers` directory in the build directory
//   - add the plugin in `netlify.toml`
const usesEdgeHandlers = async function({ buildDir, plugins }) {
  const edgeHandlersDir = `${buildDir}/${EDGE_HANDLERS_LOCATION}`
  return plugins.some(isEdgeHandlersPlugin) || (await isDirectory(edgeHandlersDir))
}

const isEdgeHandlersPlugin = function({ package }) {
  return package === EDGE_HANDLERS_PLUGIN_NAME
}

const EDGE_HANDLERS_LOCATION = 'edge-handlers'

const isCorePlugin = function(package) {
  return CORE_PLUGINS.includes(package)
}

module.exports = { getCorePlugins, isCorePlugin }
