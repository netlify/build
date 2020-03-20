const { promisify } = require('util')
const { dirname } = require('path')

const resolve = require('resolve')
const pFilter = require('p-filter')

const { CORE_PLUGINS } = require('../plugins_core/main')
const { addDependencies } = require('../utils/install')
const { logInstallMissingPlugins } = require('../log/main')

const { getPackageJson } = require('./package')
const { useManifest } = require('./manifest/main')

const pResolve = promisify(resolve)

// Load plugin options (specified by user in `config.plugins`)
const getPluginsOptions = async function({ plugins }, buildDir, configPath) {
  const pluginsOptions = [...CORE_PLUGINS, ...plugins].map(normalizePluginOptions)
  const basedir = getBasedir(buildDir, configPath)
  await installMissingPlugins(pluginsOptions, basedir)
  const pluginsOptionsA = await Promise.all(
    pluginsOptions.map(pluginOptions => loadPluginFiles({ pluginOptions, basedir })),
  )
  return pluginsOptionsA
}

const normalizePluginOptions = function({ package, location = package, core = false, inputs = {} }) {
  const local = package.startsWith('.') || package.startsWith('/')
  return { package, location, local, core, inputs }
}

// The base directory used when resolving plugins path or package names.
// This resolution should be relative to the configuration file since this is
// what users would expect. If no configuration file is present, we use
// `buildDir`.
// We use `resolve` because `require()` does not allow custom base directory.
const getBasedir = function(buildDir, configPath) {
  if (configPath === undefined) {
    return buildDir
  }

  return dirname(configPath)
}

// Automatically install plugins if not installed already
const installMissingPlugins = async function(pluginsOptions, basedir) {
  const missingPlugins = await pFilter(pluginsOptions, pluginOptions => isMissingPlugin(pluginOptions, basedir))
  if (missingPlugins.length === 0) {
    return
  }

  const packages = missingPlugins.map(getPackage)
  logInstallMissingPlugins(packages)
  await addDependencies({ packageRoot: basedir, packages })
}

const isMissingPlugin = async function({ location }, basedir) {
  try {
    await pResolve(location, { basedir })
    return false
  } catch (error) {
    return true
  }
}

const getPackage = function({ package }) {
  return package
}

// Retrieve plugin's main file path.
// Then load plugin's `package.json` and `manifest.yml`.
const loadPluginFiles = async function({ pluginOptions, pluginOptions: { location, local }, basedir }) {
  const pluginPath = await pResolve(location, { basedir })
  const pluginDir = dirname(pluginPath)
  const { packageDir, packageJson } = await getPackageJson({ pluginDir, local })
  const { manifest, inputs: inputsA } = await useManifest(pluginOptions, { pluginDir, packageDir, packageJson })
  return { ...pluginOptions, pluginPath, packageDir, packageJson, manifest, inputs: inputsA }
}

module.exports = { getPluginsOptions }
