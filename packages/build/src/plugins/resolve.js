'use strict'

const pathExists = require('path-exists')

const { addErrorInfo } = require('../error/info')
const { installMissingPlugins, getAutoPluginsDirPath, warnOnMissingPlugins } = require('../install/missing')
const { resolvePath } = require('../utils/resolve')

// Try to find plugins in four places, by priority order:
//  - already loaded (core plugins)
//  - local plugin
//  - external plugin already installed in `node_modules`, most likely through `package.json`
//  - cached in the build image
//  - automatically installed by us (fallback)
const resolvePluginsPath = async function ({ pluginsOptions, buildDir, mode, logs, buildImagePluginsDir }) {
  const pluginsOptionsA = await Promise.all(
    pluginsOptions.map((pluginOptions) => resolvePluginPath({ pluginOptions, buildDir, buildImagePluginsDir })),
  )
  const pluginsOptionsB = await handleMissingPlugins({
    pluginsOptions: pluginsOptionsA,
    buildDir,
    mode,
    buildImagePluginsDir,
    logs,
  })
  return pluginsOptionsB
}

const resolvePluginPath = async function ({
  pluginOptions,
  pluginOptions: { packageName, loadedFrom },
  buildDir,
  buildImagePluginsDir,
}) {
  // Core plugins
  if (loadedFrom !== undefined) {
    return pluginOptions
  }

  const packageNameA = resolvePackagePath(packageName)

  // Local plugins
  if (packageNameA.startsWith('.')) {
    const localPath = await tryLocalPath(packageNameA, buildDir)
    return { ...pluginOptions, pluginPath: localPath, loadedFrom: 'local' }
  }

  // Plugin already installed in the project, most likely either local plugins,
  // or external plugins added to `package.json`
  const manualPath = await tryResolvePath(packageNameA, buildDir)
  if (manualPath !== undefined) {
    return { ...pluginOptions, pluginPath: manualPath, loadedFrom: 'package.json' }
  }

  // Cached in the build image
  const buildImagePath = await tryBuildImagePath({ packageName: packageNameA, buildDir, buildImagePluginsDir })
  if (buildImagePath !== undefined) {
    return { ...pluginOptions, pluginPath: buildImagePath, loadedFrom: 'image_cache' }
  }

  // Otherwise, it must be automatically installed, as a fallback
  return pluginOptions
}

// `packageName` starting with `/` are relative to the build directory
const resolvePackagePath = function (packageName) {
  if (packageName.startsWith('/')) {
    return `.${packageName}`
  }

  return packageName
}

// Try to `resolve()` a local plugin
const tryLocalPath = async function (packageName, baseDir) {
  try {
    return await resolvePath(packageName, baseDir)
  } catch (error) {
    error.message = `Plugin could not be found using local path: ${packageName}\n${error.message}`
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

// Try to `resolve()` the plugin from the build directory
const tryResolvePath = async function (packageName, baseDir) {
  try {
    return await resolvePath(packageName, baseDir)
  } catch (error) {}
}

// Handle plugins that were neither local, in the build image cache nor in
// node_modules. We automatically install those, with a warning.
const handleMissingPlugins = async function ({ pluginsOptions, buildDir, mode, buildImagePluginsDir, logs }) {
  const autoPluginsDir = getAutoPluginsDirPath(buildDir)
  await installMissingPlugins({ pluginsOptions, autoPluginsDir, mode, logs })
  const pluginsOptionsA = await Promise.all(
    pluginsOptions.map((pluginOptions) => resolveMissingPluginPath({ pluginOptions, autoPluginsDir })),
  )
  warnOnMissingPlugins({ pluginsOptions: pluginsOptionsA, buildImagePluginsDir, logs })
  return pluginsOptionsA
}

// Resolve the plugins that just got automatically installed
const resolveMissingPluginPath = async function ({
  pluginOptions,
  pluginOptions: { packageName, pluginPath },
  autoPluginsDir,
}) {
  if (pluginPath !== undefined) {
    return pluginOptions
  }

  const automaticPath = await resolvePath(packageName, autoPluginsDir)
  return { ...pluginOptions, pluginPath: automaticPath, loadedFrom: 'auto_install' }
}

module.exports = { resolvePluginsPath }
