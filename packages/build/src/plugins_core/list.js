import { fileURLToPath } from 'url'

import { LOCAL_INSTALL_PLUGIN_NAME } from '../install/local.js'

const FUNCTIONS_INSTALL_PLUGIN = fileURLToPath(new URL('functions_install/index.js', import.meta.url))

// List of core plugin names
const FUNCTIONS_INSTALL_PLUGIN_NAME = '@netlify/plugin-functions-install-core'
const CORE_PLUGINS = new Set([FUNCTIONS_INSTALL_PLUGIN_NAME, LOCAL_INSTALL_PLUGIN_NAME])

// Plugins that are installed and enabled by default
export const listCorePlugins = function ({ FUNCTIONS_SRC }) {
  const functionsInstallPlugin = getFunctionsInstallPlugin(FUNCTIONS_SRC)
  return [functionsInstallPlugin].filter(Boolean)
}

const getFunctionsInstallPlugin = function (FUNCTIONS_SRC) {
  if (FUNCTIONS_SRC === undefined) {
    return
  }

  return { package: FUNCTIONS_INSTALL_PLUGIN_NAME, pluginPath: FUNCTIONS_INSTALL_PLUGIN, optional: true }
}

export const isCorePlugin = function (packageName) {
  return CORE_PLUGINS.has(packageName)
}
