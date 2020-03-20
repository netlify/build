const { promisify } = require('util')
const { dirname } = require('path')

const resolve = require('resolve')

const { CORE_PLUGINS } = require('../plugins_core/main')
const { addDependency } = require('../utils/install')

const { getPackageJson } = require('./package')
const { useManifest } = require('./manifest/main')

const pResolve = promisify(resolve)

// Load plugin options (specified by user in `config.plugins`)
const getPluginsOptions = async function({ plugins: pluginsOptions }, buildDir, configPath) {
  const pluginsOptionsA = [...CORE_PLUGINS, ...pluginsOptions].map(normalizePluginOptions)
  const pluginsOptionsB = await Promise.all(
    pluginsOptionsA.map(pluginOptions => resolvePlugin(pluginOptions, buildDir, configPath)),
  )
  return pluginsOptionsB
}

const normalizePluginOptions = function(pluginOptions) {
  const { package, core, inputs } = { ...DEFAULT_PLUGIN_OPTIONS, ...pluginOptions }
  const local = package.startsWith('.') || package.startsWith('/')
  return { package, local, core, inputs }
}

const DEFAULT_PLUGIN_OPTIONS = { inputs: {} }

const resolvePlugin = async function(pluginOptions, buildDir, configPath) {
  const pluginPath = await getPluginPath(pluginOptions, buildDir, configPath)
  const pluginOptionsA = await loadPluginFiles({ pluginOptions, pluginPath })
  return pluginOptionsA
}

// We use `resolve` because `require()` should be relative to `buildDir` not to
// this `__filename`
// Automatically installing the dependency if it is missing.
const getPluginPath = async function({ package, core }, buildDir, configPath) {
  const location = core === undefined ? package : core
  try {
    return await tryGetPluginPath({ location, buildDir, configPath })
  } catch (error) {
    await addDependency(location, { packageRoot: buildDir })
    return await tryGetPluginPath({ location, buildDir, configPath })
  }
}

const tryGetPluginPath = async function({ location, buildDir, configPath }) {
  const basedir = configPath === undefined ? buildDir : dirname(configPath)
  const pluginPath = await pResolve(location, { basedir })
  return pluginPath
}

// Load plugin's `package.json` and `manifest.yml`
const loadPluginFiles = async function({ pluginOptions, pluginOptions: { local }, pluginPath }) {
  const pluginDir = dirname(pluginPath)
  const { packageDir, packageJson } = await getPackageJson({ pluginDir, local })
  const { manifest, inputs: inputsA } = await useManifest(pluginOptions, { pluginDir, packageDir, packageJson })
  return { ...pluginOptions, pluginPath, packageDir, packageJson, manifest, inputs: inputsA }
}

module.exports = { getPluginsOptions }
