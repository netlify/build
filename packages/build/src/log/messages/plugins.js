'use strict'

const { getPluginOrigin } = require('../description')
const { log, logArray, logError, logSubHeader } = require('../logger')
const { THEME } = require('../theme')

const logPluginsFetchError = function (logs, message) {
  logError(
    logs,
    `
Warning: could not fetch latest plugins list. Plugins versions might not be the latest.
${message}`,
  )
}

const logPluginsList = function ({ pluginsList, debug, logs }) {
  if (!debug) {
    return
  }

  // eslint-disable-next-line fp/no-mutating-methods
  const pluginsListArray = Object.entries(pluginsList).map(getPluginsListItem).sort()

  logSubHeader(logs, 'Available plugins')
  logArray(logs, pluginsListArray)
}

const getPluginsListItem = function ([packageName, version]) {
  return `${packageName}@${version}`
}

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

const getPluginDescription = function ({ packageName, pluginPackageJson: { version = '' }, loadedFrom, origin }) {
  const versionA = version === '' ? '' : `@${version}`
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

const logDeploySuccess = function (logs) {
  log(logs, 'Site deploy was successfully initiated')
}

module.exports = {
  logPluginsFetchError,
  logPluginsList,
  logLoadingPlugins,
  logFailPluginWarning,
  logDeploySuccess,
}
