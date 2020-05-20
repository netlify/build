const { resolve } = require('path')
const { env } = require('process')

const pathExists = require('path-exists')

const { installMissingPlugins, getAutoPluginsDirPath } = require('../install/missing')
// const { logMissingPluginsWarning } = require('../log/main')
const { resolvePath } = require('../utils/resolve')

// Try to find plugins in four places, by priority order:
//  - already loaded (core plugins)
//  - local plugin
//  - external plugin already installed in `node_modules`, most likely through `package.json`
//  - cached in the build image
//  - automatically installed by us (fallback)
const resolvePluginsPath = async function({ pluginsOptions, buildDir, mode }) {
  const autoPluginsDir = getAutoPluginsDirPath(buildDir)
  const pluginsOptionsA = await Promise.all(
    pluginsOptions.map(pluginOptions => resolvePluginPath({ pluginOptions, buildDir, autoPluginsDir, mode })),
  )
  await installMissingPlugins({ pluginsOptions: pluginsOptionsA, autoPluginsDir, mode })
  const pluginsOptionsB = await Promise.all(
    pluginsOptionsA.map(pluginOptions => resolveMissingPluginPath({ pluginOptions, autoPluginsDir })),
  )
  warnOnMissingPlugins(pluginsOptionsB, mode)
  return pluginsOptionsB
}

const resolvePluginPath = async function({
  pluginOptions,
  pluginOptions: { package, loadedFrom },
  buildDir,
  autoPluginsDir,
  mode,
}) {
  // Core plugins
  if (loadedFrom !== undefined) {
    return pluginOptions
  }

  // Local plugins
  if (package.startsWith('.') || package.startsWith('/')) {
    const localPath = resolve(buildDir, package)
    return { ...pluginOptions, pluginPath: localPath, loadedFrom: 'local' }
  }

  // Plugin already installed in the project, most likely either local plugins,
  // or external plugins added to `package.json`
  const manualPath = await tryResolvePath(package, buildDir)
  if (manualPath !== undefined) {
    return { ...pluginOptions, pluginPath: manualPath, loadedFrom: 'package.json' }
  }

  // Cached in the build image
  const buildImagePath = await tryBuildImagePath(package, mode, buildDir)
  if (buildImagePath !== undefined) {
    return { ...pluginOptions, pluginPath: buildImagePath, loadedFrom: 'image_cache' }
  }

  // Plugin previously automatically installed
  const automaticPath = await tryAutomaticPath(package, autoPluginsDir)
  if (automaticPath !== undefined) {
    return { ...pluginOptions, pluginPath: automaticPath, loadedFrom: 'auto_install' }
  }

  // Otherwise, it must be automatically installed, as a fallback
  return pluginOptions
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

// Try to find plugin previously automatically installed
const tryAutomaticPath = async function(package, autoPluginsDir) {
  if (!(await pathExists(autoPluginsDir))) {
    return
  }

  return tryResolvePath(package, autoPluginsDir)
}

// Try to `resolve()` the plugin from the build directory
const tryResolvePath = async function(package, baseDir) {
  try {
    return await resolvePath(package, baseDir)
  } catch (error) {
    return
  }
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

// Warns when plugins have been automatically installed. This feature is a
// fallback that should not be relied upon because:
//  - it is much slower
//  - npm can be unreliable
// Warns both when installing the plugin, and when re-using it in a future build
// Not done for local builds, since they cannot use the alternative
// (build-image cached plugins).
const warnOnMissingPlugins = function(pluginsOptions, mode) {
  if (mode !== 'buildbot') {
    return
  }

  const packages = pluginsOptions.filter(isAutomaticallyInstalled).map(getPackage)
  if (packages.length === 0) {
    return
  }

  // TODO: re-enable warning after the following are available:
  //  - UI installs
  //  - build-image pre-installed plugins
  // logMissingPluginsWarning(packages)
}

const isAutomaticallyInstalled = function({ loadedFrom }) {
  return loadedFrom === 'auto_install'
}

const getPackage = function({ package }) {
  return package
}

module.exports = { resolvePluginsPath }
