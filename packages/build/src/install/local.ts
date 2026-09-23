import { packageDirectory } from 'package-directory'

import type { Mode } from '../core/types.js'
import type { Logs } from '../log/logger.js'
import { logInstallLocalPluginsDeps } from '../log/messages/install.js'
import type { NetlifyConfig } from '../types/config/netlify_config.js'

import { installDependencies } from './main.js'

type PluginOptions = {
  packageName: string
  loadedFrom?: string | undefined
  packageDir?: string | undefined
}

type PluginOptionsWithPackageDir = PluginOptions & { packageDir: string }

// Install dependencies of local plugins.
// Users must add this plugin to their `netlify.toml` `plugins` to use this
// feature. We don't want to provide it by default because this makes build
// slow and buggy.
export const installLocalPluginsDependencies = async function ({
  plugins,
  pluginsOptions,
  buildDir,
  mode,
  logs,
}: {
  plugins: readonly Pick<NetlifyConfig['plugins'][number], 'package'>[]
  pluginsOptions: readonly PluginOptions[]
  buildDir: string
  mode: Mode
  logs: Logs | undefined
}): Promise<void> {
  if (!plugins.some(isLocalInstallOptIn)) {
    return
  }

  const localPluginsOptions = getLocalPluginsOptions(pluginsOptions)
  if (localPluginsOptions.length === 0) {
    return
  }

  const localPluginsOptionsA = await removeMainRoot(localPluginsOptions, buildDir)
  if (localPluginsOptionsA.length === 0) {
    return
  }

  logInstallLocalPluginsDeps(logs, localPluginsOptionsA)
  await Promise.all(
    localPluginsOptionsA.map(({ packageDir }) =>
      installDependencies({ packageRoot: packageDir, isLocal: mode !== 'buildbot' }),
    ),
  )
}

const isLocalInstallOptIn = function (plugin: Pick<NetlifyConfig['plugins'][number], 'package'>): boolean {
  return plugin.package === LOCAL_INSTALL_PLUGIN_NAME
}

export const LOCAL_INSTALL_PLUGIN_NAME = '@netlify/plugin-local-install-core'

// Core plugins and non-local plugins already have their dependencies installed
const getLocalPluginsOptions = function (pluginsOptions: readonly PluginOptions[]): PluginOptionsWithPackageDir[] {
  return pluginsOptions.filter(isLocalPlugin).filter(isUnique).filter(hasPackageDir)
}

const isLocalPlugin = function ({ loadedFrom }: PluginOptions): boolean {
  return loadedFrom === 'local'
}

// Remove duplicates
const isUnique = function (
  { packageDir }: PluginOptions,
  index: number,
  pluginsOptions: readonly PluginOptions[],
): boolean {
  return pluginsOptions.slice(index + 1).every((pluginOption) => pluginOption.packageDir !== packageDir)
}

const hasPackageDir = function (pluginOptions: PluginOptions): pluginOptions is PluginOptionsWithPackageDir {
  return pluginOptions.packageDir !== undefined
}

// We only install dependencies of local plugins that have their own `package.json`
const removeMainRoot = async function (
  localPluginsOptions: PluginOptionsWithPackageDir[],
  buildDir: string,
): Promise<PluginOptionsWithPackageDir[]> {
  const mainPackageDir = await packageDirectory({ cwd: buildDir })
  return localPluginsOptions.filter(({ packageDir }) => packageDir !== mainPackageDir)
}
