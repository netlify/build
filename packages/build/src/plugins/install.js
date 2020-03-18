const pkgDir = require('pkg-dir')

const { installDependencies } = require('../utils/install')
const { logInstallPlugins } = require('../log/main')

// Install dependencies of local plugins.
// Also resolve path of plugins' main files.
const installPlugins = async function(pluginsOptions, buildDir) {
  const packageDirs = getPackageDirs(pluginsOptions)
  if (packageDirs.length === 0) {
    return
  }

  const packageDirsA = await getPackageRoots(packageDirs, buildDir)
  if (packageDirsA.length === 0) {
    return
  }

  logInstallPlugins()

  await Promise.all(packageDirsA.map(installDependencies))
}

// Core plugins and non-local plugins already have their dependencies installed
const getPackageDirs = function(pluginsOptions) {
  const packageDirs = pluginsOptions.filter(isLocalPlugin).map(getPackageDir)
  return [...new Set(packageDirs)]
}

const isLocalPlugin = function({ local }) {
  return local
}

const getPackageDir = function({ packageDir }) {
  return packageDir
}

// Retrieve `package.json` directories
const getPackageRoots = async function(packageDirs, buildDir) {
  const mainPackageDir = await pkgDir(buildDir)
  const packageDirsA = packageDirs.filter(packageDir => packageDir !== mainPackageDir)
  return [...new Set(packageDirsA)]
}

module.exports = { installPlugins }
