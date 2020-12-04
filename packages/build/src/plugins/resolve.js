'use strict'

const pathExists = require('path-exists')

const { addErrorInfo } = require('../error/info')
const { installMissingPlugins, warnOnConfigOnlyPlugins } = require('../install/missing')
const { resolvePath, tryResolvePath } = require('../utils/resolve')

const { addExpectedVersions } = require('./expected_version')

// Try to find plugins in four places, by priority order:
//  - already loaded (core plugins)
//  - local plugin
//  - external plugin already installed in `node_modules`, most likely through `package.json`
//  - automatically installed by us, to `.netlify/plugins/`
const resolvePluginsPath = async function ({
  pluginsOptions,
  buildDir,
  mode,
  featureFlags,
  logs,
  buildImagePluginsDir,
  debug,
  testOpts,
}) {
  const autoPluginsDir = getAutoPluginsDir(buildDir)
  const pluginsOptionsA = await Promise.all(
    pluginsOptions.map((pluginOptions) =>
      resolvePluginPath({ pluginOptions, buildDir, buildImagePluginsDir, featureFlags, autoPluginsDir }),
    ),
  )
  const pluginsOptionsB = await addExpectedVersions({
    pluginsOptions: pluginsOptionsA,
    autoPluginsDir,
    featureFlags,
    debug,
    logs,
    testOpts,
  })
  const pluginsOptionsC = await handleMissingPlugins({
    pluginsOptions: pluginsOptionsB,
    autoPluginsDir,
    featureFlags,
    mode,
    logs,
  })
  return pluginsOptionsC
}

// Find the path to the directory used to install plugins automatically.
// It is a subdirectory of `buildDir`, so that the plugin can require the
// project's dependencies (peer dependencies).
const getAutoPluginsDir = function (buildDir) {
  return `${buildDir}/${AUTO_PLUGINS_DIR}`
}

const AUTO_PLUGINS_DIR = '.netlify/plugins/'

// eslint-disable-next-line complexity, max-statements
const resolvePluginPath = async function ({
  pluginOptions,
  pluginOptions: { packageName, loadedFrom },
  buildDir,
  buildImagePluginsDir,
  featureFlags,
  autoPluginsDir,
}) {
  // Core plugins
  if (loadedFrom !== undefined) {
    return pluginOptions
  }

  const localPackageName = normalizeLocalPackageName(packageName)

  // Local plugins
  if (localPackageName.startsWith('.')) {
    const { path: localPath, error } = await tryResolvePath(localPackageName, buildDir)
    validateLocalPluginPath(error, localPackageName)
    return { ...pluginOptions, pluginPath: localPath, loadedFrom: 'local' }
  }

  // Plugin added to `package.json`
  const { path: manualPath } = await tryResolvePath(packageName, buildDir)
  if (manualPath !== undefined) {
    return { ...pluginOptions, pluginPath: manualPath, loadedFrom: 'package.json' }
  }

  if (featureFlags.new_plugins_install) {
    // Previously automatically installed
    const { path: automaticPath } = await tryResolvePath(packageName, autoPluginsDir)
    if (automaticPath !== undefined) {
      return { ...pluginOptions, pluginPath: automaticPath, loadedFrom: 'auto_install' }
    }
  } else {
    // Cached in the build image
    const buildImagePath = await tryBuildImagePath({ packageName, buildDir, buildImagePluginsDir })
    if (buildImagePath !== undefined) {
      return { ...pluginOptions, pluginPath: buildImagePath, loadedFrom: 'image_cache' }
    }
  }

  // Happens if the plugin:
  //  - name is mispelled
  //  - is not in our official list
  //  - is in our official list but has not been installed by this site yet
  return { ...pluginOptions, loadedFrom: 'auto_install' }
}

// `packageName` starting with `/` are relative to the build directory
const normalizeLocalPackageName = function (packageName) {
  if (packageName.startsWith('/')) {
    return `.${packageName}`
  }

  return packageName
}

// When requiring a local plugin with an invalid file path
const validateLocalPluginPath = function (error, localPackageName) {
  if (error !== undefined) {
    error.message = `Plugin could not be found using local path: ${localPackageName}\n${error.message}`
    addErrorInfo(error, { type: 'resolveConfig' })
    throw error
  }
}

// In production, we pre-install most Build plugins to that directory, for
// performance reasons
const tryBuildImagePath = async function ({ packageName, buildDir, buildImagePluginsDir }) {
  if (buildImagePluginsDir === undefined) {
    return
  }

  const buildImagePath = `${buildImagePluginsDir}/${packageName}`
  if (!(await pathExists(buildImagePath))) {
    return
  }

  return resolvePath(buildImagePath, buildDir)
}

// Install plugins from the official list that have not been previously installed.
// Print a warning if they have not been installed through the UI.
const handleMissingPlugins = async function ({ pluginsOptions, autoPluginsDir, featureFlags, mode, logs }) {
  await installMissingPlugins({ pluginsOptions, autoPluginsDir, mode, logs })
  const pluginsOptionsA = await Promise.all(
    pluginsOptions.map((pluginOptions) => resolveMissingPluginPath({ pluginOptions, autoPluginsDir })),
  )
  warnOnConfigOnlyPlugins({ pluginsOptions: pluginsOptionsA, featureFlags, logs })
  return pluginsOptionsA
}

// Resolve the plugins that just got automatically installed
const resolveMissingPluginPath = async function ({
  pluginOptions,
  pluginOptions: { packageName, expectedVersion },
  autoPluginsDir,
}) {
  if (expectedVersion === undefined) {
    return pluginOptions
  }

  const automaticPath = await resolvePath(packageName, autoPluginsDir)
  return { ...pluginOptions, pluginPath: automaticPath }
}

module.exports = { resolvePluginsPath }
