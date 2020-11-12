'use strict'

const { getPluginOrigin } = require('../description')
const { log, logArray, logError, logSubHeader } = require('../logger')
const { THEME } = require('../theme')

const logLoadingPlugins = function (logs, pluginsOptions) {
  const loadingPlugins = pluginsOptions.filter(isNotCorePlugin).map(getPluginDescription)

  if (loadingPlugins.length === 0) {
    return
  }

  logSubHeader(logs, 'Loading plugins')
  logArray(logs, loadingPlugins)
}

// We only logs plugins explicitly enabled by users
const isNotCorePlugin = function ({ origin }) {
  return origin !== 'core'
}

const getPluginDescription = function ({ packageName, pluginPackageJson: { version }, loadedFrom, origin }) {
  const versionA = version === undefined ? '' : `@${version}`
  const pluginOrigin = getPluginOrigin(loadedFrom, origin)
  return `${THEME.highlightWords(packageName)}${versionA} ${pluginOrigin}`
}

const logFailPluginWarning = function (methodName, event) {
  logError(
    undefined,
    `Plugin error: since "${event}" happens after deploy, the build has already succeeded and cannot fail anymore. This plugin should either:
- use utils.build.failPlugin() instead of utils.build.${methodName}() to clarify that the plugin failed, but not the build.
- use "onPostBuild" instead of "${event}" if the plugin failure should make the build fail too. Please note that "onPostBuild" (unlike "${event}") happens before deploy.`,
  )
}

const logDeploySuccess = function () {
  log(undefined, 'Site deploy was successfully initiated')
}

module.exports = {
  logLoadingPlugins,
  logFailPluginWarning,
  logDeploySuccess,
}
