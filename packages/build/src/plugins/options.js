const { dirname } = require('path')

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
  logs,
  debug,
}) {
  const corePlugins = getCorePlugins({ constants }).map(addCoreProperties)
  const allCorePlugins = corePlugins.filter(corePlugin => !isOptionalCore(corePlugin, plugins))
  const userPlugins = plugins.filter(isUserPlugin)
  const pluginsOptions = [...allCorePlugins, ...userPlugins].map(normalizePluginOptions)
  const pluginsOptionsA = await resolvePluginsPath({ pluginsOptions, buildDir, mode, logs, buildImagePluginsDir })
  const pluginsOptionsB = await Promise.all(
    pluginsOptionsA.map(pluginOptions => loadPluginFiles({ pluginOptions, debug })),
  )
  await installLocalPluginsDependencies({ plugins, pluginsOptions: pluginsOptionsB, buildDir, mode, logs })
  return { pluginsOptions: pluginsOptionsB }
}

const getPluginsOptions = measureDuration(tGetPluginsOptions, 'get_plugins_options')

const addCoreProperties = function(corePlugin) {
  return { ...corePlugin, loadedFrom: 'core', origin: 'core' }
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
  const inputs = await useManifest(pluginOptions, { pluginDir, packageDir, pluginPackageJson, debug })
  return { ...pluginOptions, pluginPath, pluginDir, packageDir, pluginPackageJson, inputs }
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
