import type { NetlifyPluginConstants } from '../core/constants.js'
import type { NetlifyConfig } from '../types/config/netlify_config.js'

import { type CorePlugin, listCorePlugins, isCorePlugin } from './list.js'

// `@netlify/config` adds `origin` to every plugin, and validates `pinned_version`
type ConfigPlugin = NetlifyConfig['plugins'][number] & { origin: string; pinned_version?: string | undefined }

type PluginOptionsSource = ConfigPlugin & { pluginPath?: string; loadedFrom?: 'core' }

// Add core plugins and user plugins together.
// Do not allow user override of core plugins.
export const addCorePlugins = function ({
  netlifyConfig: { plugins },
  constants,
}: {
  netlifyConfig: { plugins: readonly ConfigPlugin[] }
  constants: Pick<NetlifyPluginConstants, 'FUNCTIONS_SRC'>
}) {
  const corePlugins = listCorePlugins(constants)
  const allCorePlugins = corePlugins
    .map((corePlugin) => addCoreProperties(corePlugin, plugins))
    .filter((corePlugin) => !isOptionalCore(corePlugin, plugins))
  const userPlugins = plugins.filter(isUserPlugin)
  const allPlugins: PluginOptionsSource[] = [...userPlugins, ...allCorePlugins]
  const pluginsOptions = allPlugins.map(normalizePluginOptions)
  return pluginsOptions
}

const addCoreProperties = function (
  corePlugin: CorePlugin,
  plugins: readonly ConfigPlugin[],
): CorePlugin & Pick<ConfigPlugin, 'inputs'> & { loadedFrom: 'core'; origin: 'core' } {
  const inputs = getCorePluginInputs(corePlugin, plugins)
  return { ...corePlugin, inputs, loadedFrom: 'core', origin: 'core' }
}

// Core plugins can get inputs too
const getCorePluginInputs = function (
  corePlugin: CorePlugin,
  plugins: readonly ConfigPlugin[],
): ConfigPlugin['inputs'] {
  const configuredCorePlugin = plugins.find((plugin) => plugin.package === corePlugin.package)
  if (configuredCorePlugin === undefined) {
    return {}
  }

  return configuredCorePlugin.inputs
}

// Optional core plugins requires user opt-in
const isOptionalCore = function (pluginA: CorePlugin, plugins: readonly ConfigPlugin[]) {
  return pluginA.optional && plugins.every((pluginB) => pluginB.package !== pluginA.package)
}

const isUserPlugin = function (plugin: ConfigPlugin) {
  return !isCorePlugin(plugin.package)
}

const normalizePluginOptions = function ({
  package: packageName,
  pluginPath,
  pinned_version: pinnedVersion,
  loadedFrom,
  origin,
  inputs,
}: PluginOptionsSource) {
  return { packageName, pluginPath, pinnedVersion, loadedFrom, origin, inputs }
}
