const pkgDir = require('pkg-dir')

const { logDeprecatedLocalInstall, logInstallLocalPluginsDeps } = require('../log/main')

const { installDependencies } = require('./main')

// Install dependencies of local plugins.
const installLocalPluginsDependencies = async function({ plugins, pluginsOptions, buildDir, mode }) {
  const localPluginsOptions = getLocalPluginsOptions(pluginsOptions)
  if (localPluginsOptions.length === 0) {
    return
  }

  const localPluginsOptionsA = await removeMainRoot(localPluginsOptions, buildDir)
  if (localPluginsOptionsA.length === 0) {
    return
  }

  if (!canUseLocalPluginsInstall(plugins)) {
    // TODO: replace log statement by `return` instead once going out of beta
    logDeprecatedLocalInstall()
  }

  logInstallLocalPluginsDeps(localPluginsOptionsA)
  await Promise.all(
    localPluginsOptionsA.map(({ packageDir }) =>
      installDependencies({ packageRoot: packageDir, isLocal: mode !== 'buildbot' }),
    ),
  )
}

// Users must add this plugin to their `netlify.toml` `plugins` to use this
// feature. We don't want to provide it by default because this makes build
// slow and buggy.
const canUseLocalPluginsInstall = function(plugins) {
  return plugins.some(isLocalInstallOptIn)
}

const isLocalInstallOptIn = function({ package }) {
  return package === LOCAL_INSTALL_NAME
}

const LOCAL_INSTALL_NAME = '@netlify/plugin-local-install-core'

// Core plugins and non-local plugins already have their dependencies installed
const getLocalPluginsOptions = function(pluginsOptions) {
  return pluginsOptions.filter(isLocalPlugin).filter(isUnique)
}

const isLocalPlugin = function({ loadedFrom }) {
  return loadedFrom === 'local'
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

module.exports = { installLocalPluginsDependencies, LOCAL_INSTALL_NAME }
