const { dirname } = require('path')
const { promisify } = require('util')

const resolve = require('resolve')

const { installMissingPlugins } = require('../install/missing')
const { CORE_PLUGINS } = require('../plugins_core/main')

const { useManifest } = require('./manifest/main')
const { getPackageJson } = require('./package')

const pResolve = promisify(resolve)

// Load plugin options (specified by user in `config.plugins`)
const getPluginsOptions = async function({ netlifyConfig: { plugins }, buildDir, mode }) {
  const pluginsOptions = [...CORE_PLUGINS, ...plugins].map(normalizePluginOptions)
  await installMissingPlugins({ pluginsOptions, buildDir, mode })
  const pluginsOptionsA = await Promise.all(
    pluginsOptions.map(pluginOptions => loadPluginFiles({ pluginOptions, buildDir })),
  )
  return pluginsOptionsA
}

const normalizePluginOptions = function({ package, location = package, core = false, inputs = {} }) {
  const local = package.startsWith('.') || package.startsWith('/')
  return { package, location, local, core, inputs }
}

// Retrieve plugin's main file path.
// Then load plugin's `package.json` and `manifest.yml`.
const loadPluginFiles = async function({ pluginOptions, pluginOptions: { location }, buildDir }) {
  const pluginPath = await pResolve(location, { basedir: buildDir })
  const pluginDir = dirname(pluginPath)
  const { packageDir, packageJson } = await getPackageJson({ pluginDir })
  const { manifest, inputs: inputsA } = await useManifest(pluginOptions, { pluginDir, packageDir, packageJson })
  return { ...pluginOptions, pluginPath, packageDir, packageJson, manifest, inputs: inputsA }
}

module.exports = { getPluginsOptions }
