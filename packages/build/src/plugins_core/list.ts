import { fileURLToPath } from 'url'

import type { NetlifyPluginConstants } from '../core/constants.js'
import { LOCAL_INSTALL_PLUGIN_NAME } from '../install/local.js'

const FUNCTIONS_INSTALL_PLUGIN = fileURLToPath(new URL('functions_install/index.js', import.meta.url))

// List of core plugin names
const FUNCTIONS_INSTALL_PLUGIN_NAME = '@netlify/plugin-functions-install-core'
const CORE_PLUGINS = new Set([FUNCTIONS_INSTALL_PLUGIN_NAME, LOCAL_INSTALL_PLUGIN_NAME])

export type CorePlugin = { package: string; pluginPath: string; optional: boolean }

// Plugins that are installed and enabled by default
export const listCorePlugins = function ({
  FUNCTIONS_SRC,
}: Pick<NetlifyPluginConstants, 'FUNCTIONS_SRC'>): CorePlugin[] {
  const functionsInstallPlugin = getFunctionsInstallPlugin(FUNCTIONS_SRC)
  return [functionsInstallPlugin].filter((corePlugin) => corePlugin !== undefined)
}

const getFunctionsInstallPlugin = function (FUNCTIONS_SRC: string | undefined): CorePlugin | undefined {
  if (FUNCTIONS_SRC === undefined) {
    return
  }

  return { package: FUNCTIONS_INSTALL_PLUGIN_NAME, pluginPath: FUNCTIONS_INSTALL_PLUGIN, optional: true }
}

export const isCorePlugin = function (packageName: string): boolean {
  return CORE_PLUGINS.has(packageName)
}
