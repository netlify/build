'use strict'

const pathExists = require('path-exists')

const { addErrorInfo } = require('../error/info')
const { installMissingPlugins, warnOnConfigOnlyPlugins } = require('../install/missing')
const { resolvePath, tryResolvePath } = require('../utils/resolve')

const { addExpectedVersions } = require('./expected_version')
const { getPluginsList } = require('./list.js')

// Try to find plugins in four places, by priority order:
//  - already loaded (core plugins)
//  - local plugin
//  - external plugin already installed in `node_modules`, most likely through `package.json`
//  - cached in the build image
//  - automatically installed by us (fallback)
const resolvePluginsPath = async function ({
  pluginsOptions,
  buildDir,
  mode,
  logs,
  buildImagePluginsDir,
  debug,
  testOpts,
}) {
  const autoPluginsDir = getAutoPluginsDir(buildDir)
  const pluginsOptionsA = await Promise.all(
    pluginsOptions.map((pluginOptions) =>
      resolvePluginPath({ pluginOptions, buildDir, buildImagePluginsDir, debug, logs, testOpts }),
    ),
  )
  const pluginsOptionsB = addExpectedVersions({ pluginsOptions: pluginsOptionsA })
  const pluginsOptionsC = await handleMissingPlugins({
    pluginsOptions: pluginsOptionsB,
    autoPluginsDir,
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

const resolvePluginPath = async function ({
  pluginOptions,
  pluginOptions: { packageName, loadedFrom },
  buildDir,
  buildImagePluginsDir,
  debug,
  logs,
  testOpts,
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

  await getPluginsList({ debug, logs, testOpts })

  // Cached in the build image
  const buildImagePath = await tryBuildImagePath({ packageName, buildDir, buildImagePluginsDir })
  if (buildImagePath !== undefined) {
    return { ...pluginOptions, pluginPath: buildImagePath, loadedFrom: 'image_cache' }
  }

  // Happens if the plugin:
  //  - name is mispelled
  //  - is not in our official list
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

// Handle plugins that were neither local, in the build image cache nor in
// node_modules. We automatically install those, with a warning.
const handleMissingPlugins = async function ({ pluginsOptions, autoPluginsDir, mode, logs }) {
  await installMissingPlugins({ pluginsOptions, autoPluginsDir, mode, logs })
  const pluginsOptionsA = await Promise.all(
    pluginsOptions.map((pluginOptions) => resolveMissingPluginPath({ pluginOptions, autoPluginsDir })),
  )
  warnOnConfigOnlyPlugins({ pluginsOptions: pluginsOptionsA, logs })
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
