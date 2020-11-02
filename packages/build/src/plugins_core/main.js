'use strict'

const { isDirectory } = require('path-type')

const { LOCAL_INSTALL_PLUGIN_NAME } = require('../install/local')

const FUNCTIONS_INSTALL_PLUGIN = `${__dirname}/functions_install/index.js`
const FUNCTIONS_PLUGIN = `${__dirname}/functions/index.js`
const DEPLOY_PLUGIN = `${__dirname}/deploy/index.js`

// List of core plugin names
const FUNCTIONS_PLUGIN_NAME = '@netlify/plugin-functions-core'
const FUNCTIONS_INSTALL_PLUGIN_NAME = '@netlify/plugin-functions-install-core'
const EDGE_HANDLERS_PLUGIN_NAME = '@netlify/plugin-edge-handlers'
const DEPLOY_PLUGIN_NAME = '@netlify/plugin-deploy-core'
const DPC_PLUGIN_NAME = 'netlify-plugin-deploy-preview-commenting'
const CORE_PLUGINS = new Set([
  FUNCTIONS_PLUGIN_NAME,
  FUNCTIONS_INSTALL_PLUGIN_NAME,
  LOCAL_INSTALL_PLUGIN_NAME,
  EDGE_HANDLERS_PLUGIN_NAME,
  DEPLOY_PLUGIN_NAME,
  DPC_PLUGIN_NAME,
])

const EDGE_HANDLERS_PLUGIN_PATH = require.resolve(EDGE_HANDLERS_PLUGIN_NAME)
const DPC_PLUGIN_PATH = require.resolve(DPC_PLUGIN_NAME)

// Plugins that are installed and enabled by default
const getCorePlugins = async function ({
  constants: { FUNCTIONS_SRC, EDGE_HANDLERS_SRC, BUILDBOT_SERVER_SOCKET },
  buildDir,
  featureFlags,
  childEnv,
}) {
  const functionsPlugin = getFunctionsPlugin(FUNCTIONS_SRC)
  const functionsInstallPlugin = getFunctionsInstallPlugin(FUNCTIONS_SRC)
  const edgeHandlersPlugin = await getEdgeHandlersPlugin({ buildDir, EDGE_HANDLERS_SRC })
  const deployPlugin = getDeployPlugin(featureFlags, BUILDBOT_SERVER_SOCKET)
  const dpcPlugin = getDpcPlugin({ featureFlags, childEnv })
  return [functionsPlugin, functionsInstallPlugin, edgeHandlersPlugin, deployPlugin, dpcPlugin].filter(Boolean)
}

// When no "Functions directory" is defined, it means users does not use
// Netlify Functions.
// However when it is defined but points to a non-existing directory, this
// might mean the directory is created later one, so we cannot do that check
// yet.
const getFunctionsPlugin = function (FUNCTIONS_SRC) {
  if (FUNCTIONS_SRC === undefined) {
    return
  }

  return { package: FUNCTIONS_PLUGIN_NAME, pluginPath: FUNCTIONS_PLUGIN }
}

const getFunctionsInstallPlugin = function (FUNCTIONS_SRC) {
  if (FUNCTIONS_SRC === undefined) {
    return
  }

  return { package: FUNCTIONS_INSTALL_PLUGIN_NAME, pluginPath: FUNCTIONS_INSTALL_PLUGIN, optional: true }
}

const getEdgeHandlersPlugin = async function ({ buildDir, EDGE_HANDLERS_SRC }) {
  if (!(await usesEdgeHandlers({ buildDir, EDGE_HANDLERS_SRC }))) {
    return
  }

  return { package: EDGE_HANDLERS_PLUGIN_NAME, pluginPath: EDGE_HANDLERS_PLUGIN_PATH }
}

// To enable Edge handlers, create a `edge-handlers` directory in the build
// directory.
// The location can be overridden using the `build.edge_handlers` property in
// `netlify.toml`.
const usesEdgeHandlers = function ({ buildDir, EDGE_HANDLERS_SRC }) {
  return isDirectory(`${buildDir}/${EDGE_HANDLERS_SRC}`)
}

const getDeployPlugin = function (featureFlags, BUILDBOT_SERVER_SOCKET) {
  if (!featureFlags.service_buildbot_enable_deploy_server || BUILDBOT_SERVER_SOCKET === undefined) {
    return
  }

  return { package: DEPLOY_PLUGIN_NAME, pluginPath: DEPLOY_PLUGIN }
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
