'use strict'

const { LOCAL_INSTALL_PLUGIN_NAME } = require('../install/local')

const FUNCTIONS_INSTALL_PLUGIN = `${__dirname}/functions_install/index.js`

// List of core plugin names
const FUNCTIONS_INSTALL_PLUGIN_NAME = '@netlify/plugin-functions-install-core'
const EDGE_HANDLERS_PLUGIN_NAME = '@netlify/plugin-edge-handlers'
const DPC_PLUGIN_NAME = 'netlify-plugin-deploy-preview-commenting'
const CORE_PLUGINS = new Set([
  FUNCTIONS_INSTALL_PLUGIN_NAME,
  LOCAL_INSTALL_PLUGIN_NAME,
  EDGE_HANDLERS_PLUGIN_NAME,
  DPC_PLUGIN_NAME,
])

const EDGE_HANDLERS_PLUGIN_PATH = require.resolve(EDGE_HANDLERS_PLUGIN_NAME)
const DPC_PLUGIN_PATH = require.resolve(DPC_PLUGIN_NAME)

// Plugins that are installed and enabled by default
const getCorePlugins = function ({ constants: { FUNCTIONS_SRC, EDGE_HANDLERS_SRC }, featureFlags, childEnv }) {
  const functionsInstallPlugin = getFunctionsInstallPlugin(FUNCTIONS_SRC)
  const edgeHandlersPlugin = getEdgeHandlersPlugin(EDGE_HANDLERS_SRC)
  const dpcPlugin = getDpcPlugin({ featureFlags, childEnv })
  return [functionsInstallPlugin, edgeHandlersPlugin, dpcPlugin].filter(Boolean)
}

const getFunctionsInstallPlugin = function (FUNCTIONS_SRC) {
  if (FUNCTIONS_SRC === undefined) {
    return
  }

  return { package: FUNCTIONS_INSTALL_PLUGIN_NAME, pluginPath: FUNCTIONS_INSTALL_PLUGIN, optional: true }
}

// To enable Edge handlers, create a `edge-handlers` directory in the build
// directory.
// The location can be overridden using the `build.edge_handlers` property in
// `netlify.toml`.
const getEdgeHandlersPlugin = function (EDGE_HANDLERS_SRC) {
  if (EDGE_HANDLERS_SRC === undefined) {
    return
  }

  return { package: EDGE_HANDLERS_PLUGIN_NAME, pluginPath: EDGE_HANDLERS_PLUGIN_PATH }
}

const getDpcPlugin = function ({ featureFlags, childEnv: { CONTEXT } }) {
  if (!featureFlags.dpc || CONTEXT !== 'deploy-preview') {
    return
  }

  return { package: DPC_PLUGIN_NAME, pluginPath: DPC_PLUGIN_PATH }
}

const isCorePlugin = function (packageName) {
  return CORE_PLUGINS.has(packageName)
}

module.exports = { getCorePlugins, isCorePlugin }
