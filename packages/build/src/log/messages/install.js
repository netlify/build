'use strict'

const { log, logMessage, logArray, logSubHeader, logErrorSubHeader } = require('../logger')
const { THEME } = require('../theme')

const logInstallMissingPlugins = function (logs, packages) {
  logSubHeader(logs, 'Installing plugins')
  logArray(logs, packages)
}

const logConfigOnlyPlugins = function (logs, packages) {
  logErrorSubHeader(logs, 'Missing plugins')
  logMessage(
    logs,
    THEME.errorSubHeader(
      `Please install the following plugins using "npm install -D netlify-plugin-package-name" or "yarn add -D netlify-plugin-package-name"`,
    ),
  )
  logArray(logs, packages, { color: THEME.errorSubHeader })
}

const logInstallLocalPluginsDeps = function (logs, localPluginsOptions) {
  const packages = localPluginsOptions.map(getPackageName)
  logSubHeader(logs, 'Installing local plugins dependencies')
  logArray(logs, packages)
}

const logInstallFunctionDependencies = function () {
  log(undefined, 'Installing functions dependencies')
}

const getPackageName = function ({ packageName }) {
  return packageName
}

module.exports = {
  logInstallMissingPlugins,
  logConfigOnlyPlugins,
  logInstallLocalPluginsDeps,
  logInstallFunctionDependencies,
}
