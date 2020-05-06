const { dirname } = require('path')

const corePackageJson = require('../../package.json')
const { installMissingPlugins } = require('../install/missing')
const { CORE_PLUGINS } = require('../plugins_core/main')
const { resolveLocation } = require('../utils/resolve')

const { useManifest } = require('./manifest/main')
const { getPackageJson } = require('./package')

// Load plugin options (specified by user in `config.plugins`)
const getPluginsOptions = async function({ netlifyConfig: { plugins }, buildDir, constants: { FUNCTIONS_SRC }, mode }) {
  const pluginsOptions = [...CORE_PLUGINS(FUNCTIONS_SRC), ...plugins].map(normalizePluginOptions)
  await installMissingPlugins({ pluginsOptions, buildDir, mode })
  const pluginsOptionsA = await Promise.all(
    pluginsOptions.map(pluginOptions => loadPluginFiles({ pluginOptions, buildDir })),
  )
  return pluginsOptionsA
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
