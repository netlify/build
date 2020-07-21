const { dirname } = require('path')
const {
  env: { NETLIFY_BUILD_EVENTS_ORDER },
} = require('process')

const corePackageJson = require('../../package.json')
const { installLocalPluginsDependencies } = require('../install/local')
const { getCorePlugins, isCorePlugin } = require('../plugins_core/main')
const { measureDuration } = require('../time/main')
const { getPackageJson } = require('../utils/package')

const { useManifest } = require('./manifest/main')
const { resolvePluginsPath } = require('./resolve')

// Load plugin options (specified by user in `config.plugins`)
// Do not allow user override of core plugins
const tGetPluginsOptions = async function({
  netlifyConfig: { plugins },
  buildDir,
  constants,
  mode,
  buildImagePluginsDir,
  triggerDeployWithBuildbotServer,
  logs,
  debug,
}) {
  const corePlugins = await getCorePlugins({ constants, buildDir, triggerDeployWithBuildbotServer })
  const allCorePlugins = corePlugins
    .map(corePlugin => addCoreProperties(corePlugin, plugins))
    .filter(corePlugin => !isOptionalCore(corePlugin, plugins))
  const userPlugins = plugins.filter(isUserPlugin)
  // TODO: remove feature flag, and keep only [...userPlugins, ...allCorePlugins]
  const allPlugins =
    NETLIFY_BUILD_EVENTS_ORDER === '1' ? [...userPlugins, ...allCorePlugins] : [...allCorePlugins, ...userPlugins]
  const pluginsOptions = allPlugins.map(normalizePluginOptions)
  const pluginsOptionsA = await resolvePluginsPath({ pluginsOptions, buildDir, mode, logs, buildImagePluginsDir })
  const pluginsOptionsB = await Promise.all(
    pluginsOptionsA.map(pluginOptions => loadPluginFiles({ pluginOptions, debug })),
  )
  const pluginsOptionsC = pluginsOptionsB.filter(isNotRedundantCorePlugin)
  await installLocalPluginsDependencies({ plugins, pluginsOptions: pluginsOptionsC, buildDir, mode, logs })
  return { pluginsOptions: pluginsOptionsC }
}

const getPluginsOptions = measureDuration(tGetPluginsOptions, 'get_plugins_options')

const addCoreProperties = function(corePlugin, plugins) {
  const inputs = getCorePluginInputs(corePlugin, plugins)
  return { ...corePlugin, inputs, loadedFrom: 'core', origin: 'core' }
}

// Core plugins can get inputs too
const getCorePluginInputs = function(corePlugin, plugins) {
  const configuredCorePlugin = plugins.find(plugin => plugin.package === corePlugin.package)
  if (configuredCorePlugin === undefined) {
    return {}
  }

  return configuredCorePlugin.inputs
}

// Optional core plugins requires user opt-in
const isOptionalCore = function({ package, optional }, plugins) {
  return optional && plugins.every(plugin => plugin.package !== package)
}

const isUserPlugin = function({ package }) {
  return !isCorePlugin(package)
}

const normalizePluginOptions = function({ package, pluginPath, loadedFrom, origin, inputs }) {
  return { package, pluginPath, loadedFrom, origin, inputs }
}

// Retrieve plugin's main file path.
// Then load plugin's `package.json` and `manifest.yml`.
const loadPluginFiles = async function({ pluginOptions: { pluginPath, ...pluginOptions }, debug }) {
  const pluginDir = dirname(pluginPath)
  const { packageDir, packageJson: pluginPackageJson } = await getPackageJson(pluginDir)
  const { manifest, inputs } = await useManifest(pluginOptions, { pluginDir, packageDir, pluginPackageJson, debug })
  return { ...pluginOptions, pluginPath, pluginDir, packageDir, pluginPackageJson, manifest, inputs }
}

// Core plugins can only be included once.
// For example, when testing core plugins, they might be included as local plugins,
// in which case they should not be included twice.
const isNotRedundantCorePlugin = function(pluginOptionsA, index, pluginsOptions) {
  return (
    pluginOptionsA.loadedFrom !== 'core' ||
    pluginsOptions.every(
      pluginOptionsB =>
        pluginOptionsA.manifest.name !== pluginOptionsB.manifest.name || pluginOptionsA === pluginOptionsB,
    )
  )
}

// Retrieve information about @netlify/build when an error happens there and not
// in a plugin
const getSpawnInfo = function() {
  const { name } = corePackageJson
  return {
    plugin: { package: name, pluginPackageJson: corePackageJson },
    location: { event: 'load', package: name, loadedFrom: 'core', origin: 'core' },
  }
}

module.exports = { getPluginsOptions, getSpawnInfo }
