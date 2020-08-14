const { LOCAL_INSTALL_PLUGIN_NAME } = require('../install/local')

const FUNCTIONS_INSTALL_PLUGIN = `${__dirname}/functions_install/plugin.js`
const FUNCTIONS_PLUGIN = `${__dirname}/functions/plugin.js`

// List of core plugin names
const FUNCTIONS_PLUGIN_NAME = '@netlify/plugin-functions-core'
const FUNCTIONS_INSTALL_PLUGIN_NAME = '@netlify/plugin-functions-install-core'
const CORE_PLUGINS = [FUNCTIONS_PLUGIN_NAME, FUNCTIONS_INSTALL_PLUGIN_NAME, LOCAL_INSTALL_PLUGIN_NAME]

// Plugins that are installed and enabled by default
const getCorePlugins = function({ constants: { FUNCTIONS_SRC } }) {
  const functionsPlugin = getFunctionsPlugin(FUNCTIONS_SRC)
  const functionsInstallPlugin = getFunctionsInstallPlugin(FUNCTIONS_SRC)
  return [functionsPlugin, functionsInstallPlugin].filter(Boolean)
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

const isCorePlugin = function(package) {
  return CORE_PLUGINS.includes(package)
}

module.exports = { getCorePlugins, isCorePlugin }
