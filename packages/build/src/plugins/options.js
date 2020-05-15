const { dirname } = require('path')

const corePackageJson = require('../../package.json')
const { checkDeprecatedFunctionsInstall } = require('../install/functions')
const { getCorePlugins, CORE_PLUGINS } = require('../plugins_core/main')

const { useManifest } = require('./manifest/main')
const { getPackageJson } = require('./package')
const { resolvePluginsPath } = require('./resolve')

// Load plugin options (specified by user in `config.plugins`)
// Do not allow user override of core plugins
const getPluginsOptions = async function({
  netlifyConfig: { plugins },
  buildDir,
  constants: { FUNCTIONS_SRC },
  mode,
  api,
}) {
  const corePlugins = getCorePlugins(FUNCTIONS_SRC).map(addLoadedFromCore)
  const allCorePlugins = corePlugins.filter(corePlugin => !isOptionalCore(corePlugin, plugins))
  const userPlugins = plugins.filter(({ package }) => !CORE_PLUGINS.includes(package))
  const pluginsOptions = [...allCorePlugins, ...userPlugins].map(normalizePluginOptions)
  const pluginsOptionsA = await resolvePluginsPath({ pluginsOptions, buildDir, mode })
  const pluginsOptionsB = await Promise.all(
    pluginsOptionsA.map(pluginOptions => loadPluginFiles({ pluginOptions, mode, api })),
  )
  await checkDeprecatedFunctionsInstall(plugins, FUNCTIONS_SRC, buildDir)
  return pluginsOptionsB
}

const addLoadedFromCore = function(corePlugin) {
  return { ...corePlugin, loadedFrom: 'core' }
}

// Optional core plugins requires user opt-in
const isOptionalCore = function({ package, optional }, plugins) {
  return optional && plugins.every(plugin => plugin.package !== package)
}

const normalizePluginOptions = function({ package, pluginPath, loadedFrom, inputs = {} }) {
  const loadedFromA = getLoadedFrom(loadedFrom, package)
  return { package, pluginPath, loadedFrom: loadedFromA, inputs }
}

const getLoadedFrom = function(loadedFrom, package) {
  if (loadedFrom !== undefined) {
    return loadedFrom
  }

  if (package.startsWith('.') || package.startsWith('/')) {
    return 'local'
  }

  return 'external'
}

// Retrieve plugin's main file path.
// Then load plugin's `package.json` and `manifest.yml`.
const loadPluginFiles = async function({ pluginOptions: { pluginPath, ...pluginOptions }, mode, api }) {
  const pluginDir = dirname(pluginPath)
  const { packageDir, packageJson } = await getPackageJson(pluginDir)
  const { manifest, inputs: inputsA } = await useManifest(pluginOptions, {
    pluginDir,
    packageDir,
    packageJson,
    mode,
    api,
  })
  return { ...pluginOptions, pluginPath, packageDir, packageJson, manifest, inputs: inputsA }
}

// Retrieve information about @netlify/build when an error happens there and not
// in a plugin
const getSpawnInfo = function() {
  const { name } = corePackageJson
  return {
    plugin: { package: name, packageJson: corePackageJson },
    location: { event: 'load', package: name, loadedFrom: 'core' },
  }
}

module.exports = { getPluginsOptions, getSpawnInfo }
