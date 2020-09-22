const { isDirectory } = require('path-type')

const { LOCAL_INSTALL_PLUGIN_NAME } = require('../install/local')

const FUNCTIONS_INSTALL_PLUGIN = `${__dirname}/functions_install/index.js`
const FUNCTIONS_PLUGIN = `${__dirname}/functions/index.js`

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
const getCorePlugins = async function({ constants: { FUNCTIONS_SRC, EDGE_HANDLERS_SRC }, buildDir, plugins }) {
  const functionsPlugin = getFunctionsPlugin(FUNCTIONS_SRC)
  const functionsInstallPlugin = getFunctionsInstallPlugin(FUNCTIONS_SRC)
  const edgeHandlersPlugin = await getEdgeHandlersPlugin({ buildDir, EDGE_HANDLERS_SRC, plugins })
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

const getEdgeHandlersPlugin = async function({ buildDir, EDGE_HANDLERS_SRC, plugins }) {
  if (!(await usesEdgeHandlers({ buildDir, EDGE_HANDLERS_SRC, plugins }))) {
    return
  }

  return { package: EDGE_HANDLERS_PLUGIN_NAME, pluginPath: EDGE_HANDLERS_PLUGIN_PATH }
}

// To enable Edge handlers, create a `edge-handlers` directory in the build
// directory.
// The location can be overridden using the `build.edge_handlers` property in
// `netlify.toml`.
const usesEdgeHandlers = async function({ buildDir, EDGE_HANDLERS_SRC, plugins }) {
  return plugins.some(isEdgeHandlersPlugin) || (await isDirectory(`${buildDir}/${EDGE_HANDLERS_SRC}`))
}

const isEdgeHandlersPlugin = function({ package }) {
  return package === EDGE_HANDLERS_PLUGIN_NAME
}

const isCorePlugin = function(package) {
  return CORE_PLUGINS.includes(package)
}

module.exports = { getCorePlugins, isCorePlugin }
