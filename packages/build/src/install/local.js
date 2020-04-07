const pkgDir = require('pkg-dir')

const { logInstallLocalPluginsDeps } = require('../log/main')

const { installDependencies } = require('./main')

// Install dependencies of local plugins.
const installLocalPluginsDependencies = async function({ pluginsOptions, buildDir, mode }) {
  const localPluginsOptions = getLocalPluginsOptions(pluginsOptions)
  if (localPluginsOptions.length === 0) {
    return
  }

  const localPluginsOptionsA = await removeMainRoot(localPluginsOptions, buildDir)
  if (localPluginsOptionsA.length === 0) {
    return
  }

  logInstallLocalPluginsDeps(localPluginsOptionsA)
  await Promise.all(
    localPluginsOptionsA.map(({ packageDir }) =>
      installDependencies({ packageRoot: packageDir, isLocal: mode !== 'buildbot' }),
    ),
  )
}

// Core plugins and non-local plugins already have their dependencies installed
const getLocalPluginsOptions = function(pluginsOptions) {
  return pluginsOptions.filter(isLocalPlugin).filter(isUnique)
}

const isLocalPlugin = function({ local }) {
  return local
}

// Remove duplicates
const isUnique = function({ packageDir }, index, pluginsOptions) {
  return pluginsOptions.slice(index + 1).every(pluginOption => pluginOption.packageDir !== packageDir)
}

// We only install dependencies of local plugins that have their own `package.json`
const removeMainRoot = async function(localPluginsOptions, buildDir) {
  const mainPackageDir = await pkgDir(buildDir)
  return localPluginsOptions.filter(({ packageDir }) => packageDir !== mainPackageDir)
}

module.exports = { installLocalPluginsDependencies }
