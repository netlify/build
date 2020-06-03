const { env } = require('process')

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
const resolvePluginsPath = async function({ pluginsOptions, buildDir, mode }) {
  const pluginsOptionsA = await Promise.all(
    pluginsOptions.map(pluginOptions => resolvePluginPath({ pluginOptions, buildDir, mode })),
  )
  const pluginsOptionsB = await handleMissingPlugins({ pluginsOptions: pluginsOptionsA, buildDir, mode })
  return pluginsOptionsB
}

const resolvePluginPath = async function({ pluginOptions, pluginOptions: { package, loadedFrom }, buildDir, mode }) {
  // Core plugins
  if (loadedFrom !== undefined) {
    return pluginOptions
  }

  // `package` starting with `/` are relative to the build directory
  const packageA = package.startsWith('/') ? `.${package}` : package

  // Local plugins
  if (packageA.startsWith('.')) {
    const localPath = await tryLocalPath(packageA, buildDir)
    return { ...pluginOptions, pluginPath: localPath, loadedFrom: 'local' }
  }

  // Plugin already installed in the project, most likely either local plugins,
  // or external plugins added to `package.json`
  const manualPath = await tryResolvePath(packageA, buildDir)
  if (manualPath !== undefined) {
    return { ...pluginOptions, pluginPath: manualPath, loadedFrom: 'package.json' }
  }

  // Cached in the build image
  const buildImagePath = await tryBuildImagePath(packageA, mode, buildDir)
  if (buildImagePath !== undefined) {
    return { ...pluginOptions, pluginPath: buildImagePath, loadedFrom: 'image_cache' }
  }

  // Otherwise, it must be automatically installed, as a fallback
  return pluginOptions
}

// Try to `resolve()` a local plugin
const tryLocalPath = async function(package, baseDir) {
  try {
    return await resolvePath(package, baseDir)
  } catch (error) {
    error.message = `Plugin could not be found using local path: ${package}\n${error.message}`
    addErrorInfo(error, { type: 'resolveConfig' })
    throw error
  }
}

// In production, we pre-install most Build plugins to that directory, for
// performance reasons
const tryBuildImagePath = async function(package, mode, buildDir) {
  if (mode !== 'buildbot') {
    return
  }

  const pluginsDir = getBuildImagePluginsDir()
  const buildImagePath = `${pluginsDir}/${package}`
  if (!(await pathExists(buildImagePath))) {
    return
  }

  return resolvePath(buildImagePath, buildDir)
}

const getBuildImagePluginsDir = function() {
  if (env.TEST_BUILD_IMAGE_PLUGINS_DIR) {
    return env.TEST_BUILD_IMAGE_PLUGINS_DIR
  }

  return BUILD_IMAGE_PLUGINS_DIR
}

const BUILD_IMAGE_PLUGINS_DIR = '/opt/buildhome/.netlify-build-plugins/node_modules'

// Try to `resolve()` the plugin from the build directory
const tryResolvePath = async function(package, baseDir) {
  try {
    return await resolvePath(package, baseDir)
  } catch (error) {
    return
  }
}

// Handle plugins that were neither local, in the build image cache nor in
// node_modules. We automatically install those, with a warning.
const handleMissingPlugins = async function({ pluginsOptions, buildDir, mode }) {
  const autoPluginsDir = getAutoPluginsDirPath(buildDir)
  await installMissingPlugins({ pluginsOptions, autoPluginsDir, mode })
  const pluginsOptionsA = await Promise.all(
    pluginsOptions.map(pluginOptions => resolveMissingPluginPath({ pluginOptions, autoPluginsDir })),
  )
  warnOnMissingPlugins(pluginsOptionsA, mode)
  return pluginsOptionsA
}

// Resolve the plugins that just got automatically installed
const resolveMissingPluginPath = async function({
  pluginOptions,
  pluginOptions: { package, pluginPath },
  autoPluginsDir,
}) {
  if (pluginPath !== undefined) {
    return pluginOptions
  }

  const automaticPath = await resolvePath(package, autoPluginsDir)
  return { ...pluginOptions, pluginPath: automaticPath, loadedFrom: 'auto_install' }
}

module.exports = { resolvePluginsPath }
