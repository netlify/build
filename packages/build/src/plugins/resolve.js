const { env } = require('process')

const pathExists = require('path-exists')

const { installMissingPlugins } = require('../install/missing')
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
  await installMissingPlugins({ pluginsOptions: pluginsOptionsA, buildDir, mode })
  const pluginsOptionsB = await Promise.all(
    pluginsOptionsA.map(pluginOptions => resolveMissingPluginPath({ pluginOptions, buildDir })),
  )
  return pluginsOptionsB
}

const resolvePluginPath = async function({ pluginOptions, pluginOptions: { package, pluginPath }, buildDir, mode }) {
  // Core plugins
  if (pluginPath !== undefined) {
    return pluginOptions
  }

  // Plugin already installed in the project, most likely either local plugins,
  // or external plugins added to `package.json`
  const manualPath = await tryResolvePath(package, buildDir)
  if (manualPath !== undefined) {
    return { ...pluginOptions, pluginPath: manualPath }
  }

  // Cached in the build image
  const buildImagePath = await tryBuildImagePath(package, mode)
  if (buildImagePath !== undefined) {
    return { ...pluginOptions, pluginPath: buildImagePath }
  }

  // Otherwise, it must be automatically installed, as a fallback
  return pluginOptions
}

// Try to `resolve()` the plugin from the build directory
const tryResolvePath = async function(package, buildDir) {
  try {
    return await resolvePath(package, buildDir)
  } catch (error) {
    return
  }
}

// In production, we pre-install most Build plugins to that directory, for
// performance reasons
const tryBuildImagePath = async function(package, mode) {
  if (mode !== 'buildbot') {
    return
  }

  const pluginsDir = getBuildImagePluginsDir()
  const buildImagePath = `${pluginsDir}/${package}`
  if (!(await pathExists(buildImagePath))) {
    return
  }

  return resolvePath(buildImagePath)
}

const getBuildImagePluginsDir = function() {
  if (env.TEST_BUILD_IMAGE_PLUGINS_DIR) {
    return env.TEST_BUILD_IMAGE_PLUGINS_DIR
  }

  return BUILD_IMAGE_PLUGINS_DIR
}

const BUILD_IMAGE_PLUGINS_DIR = '/opt/buildhome/.netlify-build-plugins/node_modules'

// Resolve the plugins that just got automatically installed
const resolveMissingPluginPath = async function({ pluginOptions, pluginOptions: { package, pluginPath }, buildDir }) {
  if (pluginPath !== undefined) {
    return pluginOptions
  }

  const automaticPath = await resolvePath(package, buildDir)
  return { ...pluginOptions, pluginPath: automaticPath }
}

module.exports = { resolvePluginsPath }
