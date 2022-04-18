import { dirname } from 'path'

import { installLocalPluginsDependencies } from '../install/local.js'
import { measureDuration } from '../time/main.js'
import { ROOT_PACKAGE_JSON } from '../utils/json.js'
import { getPackageJson } from '../utils/package.js'

import { useManifest } from './manifest/main.js'
import { checkNodeVersion } from './node_version.js'
import { resolvePluginsPath } from './resolve.js'

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
  featureFlags,
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
    featureFlags,
  })
  const pluginsOptionsB = await Promise.all(
    pluginsOptionsA.map((pluginOptions) => loadPluginFiles({ pluginOptions, debug })),
  )
  const pluginsOptionsC = pluginsOptionsB.filter(isNotRedundantCorePlugin)
  await installLocalPluginsDependencies({ plugins, pluginsOptions: pluginsOptionsC, buildDir, mode, logs })
  return { pluginsOptions: pluginsOptionsC }
}

export const getPluginsOptions = measureDuration(tGetPluginsOptions, 'get_plugins_options')

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
export const getSpawnInfo = function () {
  return {
    plugin: { packageName: ROOT_PACKAGE_JSON.name, pluginPackageJson: ROOT_PACKAGE_JSON },
    location: { event: 'load', packageName: ROOT_PACKAGE_JSON.name, loadedFrom: 'core', origin: 'core' },
  }
}
