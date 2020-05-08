const { dirname } = require('path')

const corePackageJson = require('../../package.json')
const { checkDeprecatedFunctionsInstall } = require('../install/functions')
const { installMissingPlugins } = require('../install/missing')
const { getCorePlugins, CORE_PLUGINS } = require('../plugins_core/main')
const { resolveLocation } = require('../utils/resolve')

const { useManifest } = require('./manifest/main')
const { getPackageJson } = require('./package')

// Load plugin options (specified by user in `config.plugins`)
// Do not allow user override of core plugins
const getPluginsOptions = async function({ netlifyConfig: { plugins }, buildDir, constants: { FUNCTIONS_SRC }, mode }) {
  const corePlugins = getCorePlugins(FUNCTIONS_SRC)
  const allCorePlugins = corePlugins.filter(corePlugin => !isOptionalCore(corePlugin, plugins))
  const userPlugins = plugins.filter(({ package }) => !CORE_PLUGINS.includes(package))
  const pluginsOptions = [...allCorePlugins, ...userPlugins].map(normalizePluginOptions)
  await installMissingPlugins({ pluginsOptions, buildDir, mode })
  await checkDeprecatedFunctionsInstall(plugins, FUNCTIONS_SRC, buildDir)
  const pluginsOptionsA = await Promise.all(
    pluginsOptions.map(pluginOptions => loadPluginFiles({ pluginOptions, buildDir })),
  )
  return pluginsOptionsA
}

// Optional core plugins requires user opt-in
const isOptionalCore = function({ package, optional }, plugins) {
  return optional && plugins.every(plugin => plugin.package !== package)
}

const normalizePluginOptions = function({ package, location = package, core = false, inputs = {} }) {
  const local = !core && (package.startsWith('.') || package.startsWith('/'))
  return { package, location, local, core, inputs }
}

// Retrieve plugin's main file path.
// Then load plugin's `package.json` and `manifest.yml`.
const loadPluginFiles = async function({ pluginOptions, pluginOptions: { location }, buildDir }) {
  const pluginPath = await resolveLocation(location, buildDir)
  const pluginDir = dirname(pluginPath)
  const { packageDir, packageJson } = await getPackageJson({ pluginDir })
  const { manifest, inputs: inputsA } = await useManifest(pluginOptions, { pluginDir, packageDir, packageJson })
  return { ...pluginOptions, pluginPath, packageDir, packageJson, manifest, inputs: inputsA }
}

// Retrieve information about @netlify/build when an error happens there and not
// in a plugin
const getCoreInfo = function() {
  const { name } = corePackageJson
  return { package: name, packageJson: corePackageJson, local: false }
}

module.exports = { getPluginsOptions, getCoreInfo }
