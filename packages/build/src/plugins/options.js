'use strict'

const { dirname } = require('path')

const corePackageJson = require('../../package.json')
const { installLocalPluginsDependencies } = require('../install/local')
const { measureDuration } = require('../time/main')
const { getPackageJson } = require('../utils/package')

const { useManifest } = require('./manifest/main')
const { checkNodeVersion } = require('./node_version')
const { resolvePluginsPath } = require('./resolve')

// Load core plugins and user plugins
const tGetPluginsOptions = async function ({
  pluginsOptions,
  netlifyConfig: { plugins },
  siteInfo,
  buildDir,
  nodePath,
  packageJson,
  userNodeVersion,
  mode,
  api,
  logs,
  debug,
  sendStatus,
  testOpts,
}) {
  const pluginsOptionsA = await resolvePluginsPath({
    pluginsOptions,
    siteInfo,
    buildDir,
    nodePath,
    packageJson,
    userNodeVersion,
    mode,
    api,
    logs,
    debug,
    sendStatus,
    testOpts,
  })
  const pluginsOptionsB = await Promise.all(
    pluginsOptionsA.map((pluginOptions) => loadPluginFiles({ pluginOptions, debug })),
  )
  const pluginsOptionsC = pluginsOptionsB.filter(isNotRedundantCorePlugin)
  await installLocalPluginsDependencies({ plugins, pluginsOptions: pluginsOptionsC, buildDir, mode, logs })
  return { pluginsOptions: pluginsOptionsC }
}

const getPluginsOptions = measureDuration(tGetPluginsOptions, 'get_plugins_options')

// Retrieve plugin's main file path.
// Then load plugin's `package.json` and `manifest.yml`.
const loadPluginFiles = async function ({
  pluginOptions,
  pluginOptions: { pluginPath, nodeVersion, packageName },
  debug,
}) {
  const pluginDir = dirname(pluginPath)
  const { packageDir, packageJson: pluginPackageJson } = await getPackageJson(pluginDir)
  checkNodeVersion({ nodeVersion, packageName, pluginPackageJson })
  const { manifest, inputs } = await useManifest(pluginOptions, { pluginDir, packageDir, pluginPackageJson, debug })
  return { ...pluginOptions, pluginDir, packageDir, pluginPackageJson, manifest, inputs }
}

// Core plugins can only be included once.
// For example, when testing core plugins, they might be included as local plugins,
// in which case they should not be included twice.
const isNotRedundantCorePlugin = function (pluginOptionsA, index, pluginsOptions) {
  return (
    pluginOptionsA.loadedFrom !== 'core' ||
    pluginsOptions.every(
      (pluginOptionsB) =>
        pluginOptionsA.manifest.name !== pluginOptionsB.manifest.name || pluginOptionsA === pluginOptionsB,
    )
  )
}

// Retrieve information about @netlify/build when an error happens there and not
// in a plugin
const getSpawnInfo = function () {
  const { name } = corePackageJson
  return {
    plugin: { packageName: name, pluginPackageJson: corePackageJson },
    location: { event: 'load', packageName: name, loadedFrom: 'core', origin: 'core' },
  }
}

module.exports = { getPluginsOptions, getSpawnInfo }
