const { dirname } = require('path')

const findUp = require('find-up')

const { installDependencies } = require('../utils/install')
const { logInstallPlugins } = require('../log/main')

// Install dependencies of local plugins.
// Also resolve path of plugins' main files.
const installPlugins = async function(pluginsOptions, buildDir) {
  const pluginsPaths = getPluginsPaths(pluginsOptions)

  if (pluginsPaths.length === 0) {
    return
  }

  const packageRoots = await getPackageRoots(pluginsPaths, buildDir)

  if (packageRoots.length === 0) {
    return
  }

  logInstallPlugins()

  await Promise.all(packageRoots.map(installDependencies))
}

// Core plugins and non-local plugins already have their dependencies installed
const getPluginsPaths = function(pluginsOptions) {
  const pluginsPaths = pluginsOptions.filter(isLocalPlugin).map(getPluginPath)
  return [...new Set(pluginsPaths)]
}

const isLocalPlugin = function({ local }) {
  return local
}

const getPluginPath = function({ pluginPath }) {
  return pluginPath
}

// Retrieve `package.json` directories
const getPackageRoots = async function(pluginsPaths, buildDir) {
  const [repositoryRoot, ...packageRoots] = await Promise.all([buildDir, ...pluginsPaths].map(findPackageRoot))
  const packageRootsA = packageRoots.filter(packageRoot => packageRoot !== repositoryRoot)
  return [...new Set(packageRootsA)]
}

const findPackageRoot = async function(cwd) {
  const packagePath = await findUp('package.json', { cwd })

  if (packagePath === undefined) {
    return
  }

  const packageRoot = dirname(packagePath)
  return packageRoot
}

module.exports = { installPlugins }
