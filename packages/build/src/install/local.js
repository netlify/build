const pkgDir = require('pkg-dir')

const { logInstallLocalPluginsDeps } = require('../log/main')

const { installDependencies } = require('./main')

// Install dependencies of local plugins.
// Users must add this plugin to their `netlify.toml` `plugins` to use this
// feature. We don't want to provide it by default because this makes build
// slow and buggy.
const installLocalPluginsDependencies = async function({ plugins, pluginsOptions, buildDir, mode, logs }) {
  if (!plugins.some(isLocalInstallOptIn)) {
    return
  }

  const localPluginsOptions = getLocalPluginsOptions(pluginsOptions)
  if (localPluginsOptions.length === 0) {
    return
  }

  const localPluginsOptionsA = await removeMainRoot(localPluginsOptions, buildDir)
  if (localPluginsOptionsA.length === 0) {
    return
  }

  logInstallLocalPluginsDeps(logs, localPluginsOptionsA)
  await Promise.all(
    localPluginsOptionsA.map(({ packageDir }) =>
      installDependencies({ packageRoot: packageDir, isLocal: mode !== 'buildbot' }),
    ),
  )
}

const isLocalInstallOptIn = function({ package }) {
  return package === LOCAL_INSTALL_PLUGIN_NAME
}

const LOCAL_INSTALL_PLUGIN_NAME = '@netlify/plugin-local-install-core'

// Core plugins and non-local plugins already have their dependencies installed
const getLocalPluginsOptions = function(pluginsOptions) {
  return pluginsOptions
    .filter(isLocalPlugin)
    .filter(isUnique)
    .filter(hasPackageDir)
}

const isLocalPlugin = function({ loadedFrom }) {
  return loadedFrom === 'local'
}

// Remove duplicates
const isUnique = function({ packageDir }, index, pluginsOptions) {
  return pluginsOptions.slice(index + 1).every(pluginOption => pluginOption.packageDir !== packageDir)
}

const hasPackageDir = function({ packageDir }) {
  return packageDir !== undefined
}

// We only install dependencies of local plugins that have their own `package.json`
const removeMainRoot = async function(localPluginsOptions, buildDir) {
  const mainPackageDir = await pkgDir(buildDir)
  return localPluginsOptions.filter(({ packageDir }) => packageDir !== mainPackageDir)
}

module.exports = { installLocalPluginsDependencies, LOCAL_INSTALL_PLUGIN_NAME }
