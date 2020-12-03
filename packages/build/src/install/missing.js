'use strict'

const { writeFile } = require('fs')
const { promisify } = require('util')

const makeDir = require('make-dir')
const pathExists = require('path-exists')

const { logInstallMissingPlugins, logConfigOnlyPlugins } = require('../log/messages/install')

const { addDependencies } = require('./main')

const pWriteFile = promisify(writeFile)

// Automatically install plugins if not already installed.
// Since this is done under the hood, we always use `npm` with specific `npm`
// options. We do not allow configure the package manager nor its options.
// Users requiring `yarn` or custom npm/yarn flags should install the plugin in
// their `package.json`.
const installMissingPlugins = async function ({ pluginsOptions, autoPluginsDir, mode, logs }) {
  const packages = getMissingPlugins(pluginsOptions)
  if (packages.length === 0) {
    return
  }

  logInstallMissingPlugins(logs, packages)

  await createAutoPluginsDir(autoPluginsDir)
  await addDependencies({ packageRoot: autoPluginsDir, isLocal: mode !== 'buildbot', packages })
}

const getMissingPlugins = function (pluginsOptions) {
  return pluginsOptions.filter(isMissingPlugin).map(getPackage)
}

const isMissingPlugin = function ({ expectedVersion }) {
  return expectedVersion !== undefined
}

const getPackageName = function ({ packageName }) {
  return packageName
}

const getPackage = function ({ packageName, expectedVersion }) {
  return `${packageName}@${expectedVersion}`
}

const createAutoPluginsDir = async function (autoPluginsDir) {
  await ensureDir(autoPluginsDir)
  await createPackageJson(autoPluginsDir)
}

// Create the directory if it does not exist
const ensureDir = async function (autoPluginsDir) {
  if (await pathExists(autoPluginsDir)) {
    return
  }

  await makeDir(autoPluginsDir)
}

// Create a dummy `package.json` so we can run `npm install` and get a lock file
const createPackageJson = async function (autoPluginsDir) {
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

// External plugins must be installed either in the UI or in `package.json`.
// A third way is deprecated: adding it to `netlify.toml` but not in
// `package.json`. In that case, the plugin will be automatically installed
// like UI plugins.
// We still support this for backward compatibility but print a warning on each
// build (even if the plugin was installed in a previous build).
// We deprecate this third way because:
//  - having fewer ways of installing plugins is simpler
//  - using `package.json` is faster and more reliable
const warnOnConfigOnlyPlugins = function ({ pluginsOptions, logs }) {
  const packages = pluginsOptions.filter(isConfigOnlyPlugin).map(getPackageName)
  if (packages.length === 0) {
    return
  }

  logConfigOnlyPlugins(logs, packages)
}

const isConfigOnlyPlugin = function ({ loadedFrom, origin }) {
  return loadedFrom === 'auto_install' && origin === 'config'
}

module.exports = { installMissingPlugins, warnOnConfigOnlyPlugins }
