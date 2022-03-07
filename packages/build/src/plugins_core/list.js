import { createRequire } from 'module'
import { fileURLToPath } from 'url'

import { LOCAL_INSTALL_PLUGIN_NAME } from '../install/local.js'

// TODO: use `import.resolve()` once it is available without any experimental
// flags
const require = createRequire(import.meta.url)

const FUNCTIONS_INSTALL_PLUGIN = fileURLToPath(new URL('functions_install/index.js', import.meta.url))

// List of core plugin names
const FUNCTIONS_INSTALL_PLUGIN_NAME = '@netlify/plugin-functions-install-core'
const EDGE_HANDLERS_PLUGIN_NAME = '@netlify/plugin-edge-handlers'
const CORE_PLUGINS = new Set([FUNCTIONS_INSTALL_PLUGIN_NAME, LOCAL_INSTALL_PLUGIN_NAME, EDGE_HANDLERS_PLUGIN_NAME])

const EDGE_HANDLERS_PLUGIN_PATH = require.resolve(EDGE_HANDLERS_PLUGIN_NAME)

// Plugins that are installed and enabled by default
export const listCorePlugins = function ({ FUNCTIONS_SRC, EDGE_HANDLERS_SRC }) {
  const functionsInstallPlugin = getFunctionsInstallPlugin(FUNCTIONS_SRC)
  const edgeHandlersPlugin = getEdgeHandlersPlugin(EDGE_HANDLERS_SRC)
  return [functionsInstallPlugin, edgeHandlersPlugin].filter(Boolean)
}

const getFunctionsInstallPlugin = function (FUNCTIONS_SRC) {
  if (FUNCTIONS_SRC === undefined) {
    return
  }

  return { package: FUNCTIONS_INSTALL_PLUGIN_NAME, pluginPath: FUNCTIONS_INSTALL_PLUGIN, optional: true }
}

// To enable Edge handlers, create a `netlify/edge-handlers` directory in the build
// directory.
// The location can be overridden using the `build.edge_handlers` property in
// `netlify.toml`.
const getEdgeHandlersPlugin = function (EDGE_HANDLERS_SRC) {
  if (EDGE_HANDLERS_SRC === undefined) {
    return
  }

  return { package: EDGE_HANDLERS_PLUGIN_NAME, pluginPath: EDGE_HANDLERS_PLUGIN_PATH }
}

export const isCorePlugin = function (packageName) {
  return CORE_PLUGINS.has(packageName)
}
