const { writeFile } = require('fs')
const { promisify } = require('util')

const makeDir = require('make-dir')
const pathExists = require('path-exists')

const { logInstallMissingPlugins, logMissingPluginsWarning } = require('../log/main')

const { addLatestDependencies } = require('./main')

const pWriteFile = promisify(writeFile)

// Find the path to the directory used to install plugins automatically.
// It is a subdirectory of `buildDir`, so that the plugin can require the
// project's dependencies (peer dependencies).
const getAutoPluginsDirPath = function(buildDir) {
  return `${buildDir}/${AUTO_PLUGINS_DIR}`
}

const AUTO_PLUGINS_DIR = '.netlify/plugins/'

// Automatically install plugins if not already installed nor cached in the
// build image.
// This is a fallback that is discouraged.
// We are always using `npm` to mimic the behavior of plugins cached in the
// build image. Users requiring `yarn` or custom npm/yarn flags should install
// the plugin in their `package.json`.
const installMissingPlugins = async function({ pluginsOptions, autoPluginsDir, mode, logs }) {
  const packages = getMissingPlugins(pluginsOptions)
  if (packages.length === 0) {
    return
  }

  logInstallMissingPlugins(logs, packages)

  await createAutoPluginsDir(autoPluginsDir)
  await addLatestDependencies({ packageRoot: autoPluginsDir, isLocal: mode !== 'buildbot', packages })
}

const getMissingPlugins = function(pluginsOptions) {
  return pluginsOptions.filter(isMissingPlugin).map(getPackage)
}

const isMissingPlugin = function({ pluginPath }) {
  return pluginPath === undefined
}

const getPackage = function({ package }) {
  return package
}

const createAutoPluginsDir = async function(autoPluginsDir) {
  await ensureDir(autoPluginsDir)
  await createPackageJson(autoPluginsDir)
}

// Create the directory if it does not exist
const ensureDir = async function(autoPluginsDir) {
  if (await pathExists(autoPluginsDir)) {
    return
  }

  await makeDir(autoPluginsDir)
}

// Create a dummy `package.json` so we can run `npm install` and get a lock file
const createPackageJson = async function(autoPluginsDir) {
  const packageJsonPath = `${autoPluginsDir}/package.json`
  if (await pathExists(packageJsonPath)) {
    return
  }

  const packageJsonContent = JSON.stringify(AUTO_PLUGINS_PACKAGE_JSON, null, 2)
  await pWriteFile(packageJsonPath, packageJsonContent)
}

const AUTO_PLUGINS_PACKAGE_JSON = {
  name: 'netlify-local-plugins',
  description: 'This directory contains Build plugins that have been automatically installed by Netlify.',
  version: '1.0.0',
  private: true,
  author: 'Netlify',
  license: 'MIT',
}

// Warns when plugins have been automatically installed. This feature is a
// fallback that should not be relied upon because:
//  - it is much slower
//  - npm can be unreliable
// Warns both when installing the plugin, and when re-using it in a future build
// Not done for local builds, since they cannot use the alternative
// (build-image cached plugins).
// We also do not warn if the plugin has been installed through the UI. This is
// because there is always a time gap between the moment when:
//  - a plugin is shown in the UI (`plugins.json` in `netlify/build` updated)
//  - a plugin is pre-installed in the `build-image` (`buildbot` deployed)
const warnOnMissingPlugins = function({ pluginsOptions, buildImagePluginsDir, logs }) {
  if (buildImagePluginsDir === undefined) {
    return
  }

  const packages = pluginsOptions.filter(isAutomaticallyInstalled).map(getPackage)
  if (packages.length === 0) {
    return
  }

  logMissingPluginsWarning(logs, packages)
}

const isAutomaticallyInstalled = function({ loadedFrom, origin }) {
  return loadedFrom === 'auto_install' && origin === 'config'
}

module.exports = { getAutoPluginsDirPath, installMissingPlugins, warnOnMissingPlugins }
