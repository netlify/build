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
    `Warning: we have detected the following plugins ${pluginNames.join(
      ', ',
    )} have been installed locally or via package.json. The Node.js version used for the execution of this types of plugins in our build system will be changing soon (in your case ${userNodeVersion}) to always rely on the version we set for our system (version ${currentNodeVersion}). If you're relying on a plugin from our plugin list it almost certainly supports this, however if that is not the case please double check the plugin compatibility.
For more info or questions see - https://answers.netlify.com/t/breaking-change-using-system-node-version-to-run-build-plugins/38680`,
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
