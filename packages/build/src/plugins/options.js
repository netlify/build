const { dirname } = require('path')

const corePackageJson = require('../../package.json')
const { installLocalPluginsDependencies } = require('../install/local')
const { getCorePlugins, CORE_PLUGINS, EARLY_CORE_PLUGINS } = require('../plugins_core/main')

const { useManifest } = require('./manifest/main')
const { getPackageJson } = require('./package')
const { resolvePluginsPath } = require('./resolve')

// Load plugin options (specified by user in `config.plugins`)
// Do not allow user override of core plugins
const getPluginsOptions = async function({
  netlifyConfig,
  netlifyConfig: { plugins },
  buildDir,
  constants: { FUNCTIONS_SRC },
  mode,
  api,
  errorMonitor,
  deployId,
  logs,
  testOpts,
}) {
  const corePlugins = getCorePlugins(FUNCTIONS_SRC, testOpts).map(addCoreProperties)
  const allCorePlugins = corePlugins.filter(corePlugin => !isOptionalCore(corePlugin, plugins))
  const userPlugins = plugins.filter(isUserPlugin)
  const pluginsOptions = [...allCorePlugins, ...userPlugins].map(normalizePluginOptions)
  const pluginsOptionsA = await resolvePluginsPath({ pluginsOptions, buildDir, mode, logs, testOpts })
  const pluginsOptionsB = await Promise.all(
    pluginsOptionsA.map(pluginOptions =>
      loadPluginFiles({ pluginOptions, mode, api, netlifyConfig, errorMonitor, deployId, logs, testOpts }),
    ),
  )
  await installLocalPluginsDependencies({ plugins, pluginsOptions: pluginsOptionsB, buildDir, mode, logs })
  return pluginsOptionsB
}

const addCoreProperties = function(corePlugin) {
  return { ...corePlugin, loadedFrom: 'core', origin: 'core' }
}

// Optional core plugins requires user opt-in
const isOptionalCore = function({ package, optional }, plugins) {
  return optional && plugins.every(plugin => plugin.package !== package)
}

const isUserPlugin = function({ package }) {
  return !CORE_PLUGINS.includes(package) && !EARLY_CORE_PLUGINS.includes(package)
}

const normalizePluginOptions = function({ package, pluginPath, loadedFrom, origin, inputs }) {
  return { package, pluginPath, loadedFrom, origin, inputs }
}

// Retrieve plugin's main file path.
// Then load plugin's `package.json` and `manifest.yml`.
const loadPluginFiles = async function({
  pluginOptions: { pluginPath, ...pluginOptions },
  mode,
  api,
  netlifyConfig,
  errorMonitor,
  deployId,
  logs,
  testOpts,
}) {
  const pluginDir = dirname(pluginPath)
  const { packageDir, packageJson } = await getPackageJson(pluginDir)
  const inputs = await useManifest(pluginOptions, {
    pluginDir,
    packageDir,
    packageJson,
    mode,
    api,
    netlifyConfig,
    errorMonitor,
    deployId,
    logs,
    testOpts,
  })
  return { ...pluginOptions, pluginPath, packageDir, packageJson, inputs }
}

// Retrieve information about @netlify/build when an error happens there and not
// in a plugin
const getSpawnInfo = function() {
  const { name } = corePackageJson
  return {
    plugin: { package: name, packageJson: corePackageJson },
    location: { event: 'load', package: name, loadedFrom: 'core', origin: 'core' },
  }
}

module.exports = { getPluginsOptions, getSpawnInfo }
