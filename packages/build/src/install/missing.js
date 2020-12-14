'use strict'

const { writeFile, unlink } = require('fs')
const { normalize } = require('path')
const { promisify } = require('util')

const makeDir = require('make-dir')
const pathExists = require('path-exists')
const { isFile } = require('path-type')

const { logInstallMissingPlugins, logPluginsFileWarning } = require('../log/messages/install')

const { addExactDependencies } = require('./main')

const pWriteFile = promisify(writeFile)
const pUnlink = promisify(unlink)

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

  await createAutoPluginsDir(logs, autoPluginsDir)
  await addExactDependencies({ packageRoot: autoPluginsDir, isLocal: mode !== 'buildbot', packages })
}

const getMissingPlugins = function (pluginsOptions) {
  return pluginsOptions.filter(isMissingPlugin).map(getPackage)
}

const isMissingPlugin = function ({ expectedVersion }) {
  return expectedVersion !== undefined
}

// We pin the version without using semver ranges ^ nor ~
const getPackage = function ({ packageName, expectedVersion }) {
  return `${packageName}@${expectedVersion}`
}

const createAutoPluginsDir = async function (logs, autoPluginsDir) {
  await ensureDir(logs, autoPluginsDir)
  await createPackageJson(autoPluginsDir)
}

// Create the directory if it does not exist
const ensureDir = async function (logs, autoPluginsDir) {
  if (await pathExists(autoPluginsDir)) {
    return
  }

  // If `.netlify` exists but is not a directory, we remove it first
  const autoPluginsParent = normalize(`${autoPluginsDir}/..`)
  if (await isFile(autoPluginsParent)) {
    logPluginsFileWarning(logs, autoPluginsParent)
    await pUnlink(autoPluginsParent)
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

module.exports = { installMissingPlugins }
