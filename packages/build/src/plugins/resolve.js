'use strict'

const { addErrorInfo } = require('../error/info')
const { installMissingPlugins } = require('../install/missing')
const { resolvePath, tryResolvePath } = require('../utils/resolve')

const { addExpectedVersions } = require('./expected_version')

// Try to find plugins in four places, by priority order:
//  - already loaded (core plugins)
//  - local plugin
//  - external plugin already installed in `node_modules`, most likely through `package.json`
//  - automatically installed by us, to `.netlify/plugins/`
const resolvePluginsPath = async function ({ pluginsOptions, buildDir, mode, logs, debug, testOpts }) {
  const autoPluginsDir = getAutoPluginsDir(buildDir)
  const pluginsOptionsA = await Promise.all(
    pluginsOptions.map((pluginOptions) => resolvePluginPath({ pluginOptions, buildDir, autoPluginsDir })),
  )
  const pluginsOptionsB = await addExpectedVersions({
    pluginsOptions: pluginsOptionsA,
    autoPluginsDir,
    debug,
    logs,
    testOpts,
  })
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

  // Previously automatically installed
  const { path: automaticPath } = await tryResolvePath(packageName, autoPluginsDir)
  if (automaticPath !== undefined) {
    return { ...pluginOptions, pluginPath: automaticPath, loadedFrom: 'auto_install' }
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

// Install plugins from the official list that have not been previously installed.
// Print a warning if they have not been installed through the UI.
const handleMissingPlugins = async function ({ pluginsOptions, autoPluginsDir, mode, logs }) {
  await installMissingPlugins({ pluginsOptions, autoPluginsDir, mode, logs })
  return await Promise.all(
    pluginsOptions.map((pluginOptions) => resolveMissingPluginPath({ pluginOptions, autoPluginsDir })),
  )
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
