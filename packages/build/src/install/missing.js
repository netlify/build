const { writeFile } = require('fs')
const { promisify } = require('util')

const makeDir = require('make-dir')
const pathExists = require('path-exists')

const { logInstallMissingPlugins } = require('../log/main')

const { addDependencies } = require('./main')

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
const installMissingPlugins = async function({ pluginsOptions, autoPluginsDir, mode }) {
  const packages = getMissingPlugins(pluginsOptions)
  if (packages.length === 0) {
    return
  }

  logInstallMissingPlugins(packages)

  await createAutoPluginsDir(autoPluginsDir)
  await addDependencies({ packageRoot: autoPluginsDir, isLocal: mode !== 'buildbot', packages })
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

module.exports = { getAutoPluginsDirPath, installMissingPlugins }
