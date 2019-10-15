const { dirname } = require('path')
const { promisify } = require('util')

const resolve = require('resolve')
const findUp = require('find-up')

const { installDependencies } = require('../utils/install')
const { logInstallPlugins } = require('../log/main')

const pResolve = promisify(resolve)

// Install dependencies of local plugins.
// Also resolve path of plugins' main files.
const installPlugins = async function(pluginsOptions, baseDir) {
  logInstallPlugins()

  const pluginsOptionsA = await Promise.all(pluginsOptions.map(pluginOptions => resolvePlugin(pluginOptions, baseDir)))

  await installPluginDependencies(pluginsOptionsA, baseDir)

  return pluginsOptionsA
}

// We use `resolve` because `require()` should be relative to `baseDir` not to
// this `__filename`
const resolvePlugin = async function({ type, ...pluginOptions }, baseDir) {
  try {
    const pluginPath = await pResolve(type, { basedir: baseDir })
    return { ...pluginOptions, type, pluginPath }
  } catch (error) {
    error.message = `'${type}' plugin not installed or found\n${error.message}`
    throw error
  }
}

const installPluginDependencies = async function(pluginsOptions, baseDir) {
  const pluginsPaths = getPluginsPaths(pluginsOptions)

  if (pluginsPaths.length === 0) {
    return
  }

  const packageRoots = await getPackageRoots(pluginsPaths, baseDir)

  await Promise.all(packageRoots.map(installDependencies))
}

// Core plugins and non-local plugins already have their dependencies installed
const getPluginsPaths = function(pluginsOptions) {
  const pluginsPaths = pluginsOptions.filter(isLocalPlugin).map(getPluginPath)
  return [...new Set(pluginsPaths)]
}

const isLocalPlugin = function({ core, type }) {
  return !core && (type.startsWith('.') || type.startsWith('/'))
}

const getPluginPath = function({ pluginPath }) {
  return pluginPath
}

// Retrieve `package.json` directories
const getPackageRoots = async function(pluginsPaths, baseDir) {
  const [baseRoot, ...packageRoots] = await Promise.all([baseDir, ...pluginsPaths].map(findPackageRoot))
  const packageRootsA = packageRoots.filter(packageRoot => packageRoot !== baseRoot)
  return [...new Set(packageRootsA)]
}

const findPackageRoot = async function(cwd) {
  const packagePath = await findUp('package.json', { cwd })
  const packageRoot = dirname(packagePath)
  return packageRoot
}

module.exports = { installPlugins }
