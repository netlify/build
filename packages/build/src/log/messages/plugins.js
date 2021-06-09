'use strict'

const { inspect } = require('util')

const { log, logArray, logWarning, logSubHeader } = require('../logger')

const logPluginsFetchError = function (logs, message) {
  logWarning(
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

const getPluginsListItem = function ([packageName, versions]) {
  return `${packageName}@${versions[0].version}`
}

const logFailPluginWarning = function (methodName, event) {
  logWarning(
    undefined,
    `Plugin error: since "${event}" happens after deploy, the build has already succeeded and cannot fail anymore. This plugin should either:
- use utils.build.failPlugin() instead of utils.build.${methodName}() to clarify that the plugin failed, but not the build.
- use "onPostBuild" instead of "${event}" if the plugin failure should make the build fail too. Please note that "onPostBuild" (unlike "${event}") happens before deploy.`,
  )
}

const logPluginNodeVersionWarning = function ({ logs, pluginNames, userNodeVersion, currentNodeVersion }) {
  logWarning(
    logs,
    `Warning: please ensure the following build plugins are compatible with Node.js ${currentNodeVersion}: ${pluginNames.join(
      ', ',
    )}. Those plugins are currently run with Node.js ${userNodeVersion} and we will soon be changing it to always rely on our system's Node.js version (currently ${currentNodeVersion}). For more info see - https://answers.netlify.com/t/breaking-change-using-system-node-version-to-run-build-plugins/38680`,
  )
}

const logDeploySuccess = function (logs) {
  log(logs, 'Site deploy was successfully initiated')
}

const logConfigMutation = function (propName, value) {
  const mutationText =
    value === undefined
      ? `Netlify configuration property "${propName}" deleted.`
      : `Netlify configuration property "${propName}" value changed to ${inspect(value, { colors: false })}.`
  log(undefined, mutationText)
}

module.exports = {
  logPluginsFetchError,
  logPluginsList,
  logFailPluginWarning,
  logDeploySuccess,
  logConfigMutation,
  logPluginNodeVersionWarning,
}
