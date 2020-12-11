'use strict'

const { basename } = require('path')

const { log, logMessage, logArray, logSubHeader, logErrorSubHeader } = require('../logger')
const { THEME } = require('../theme')

const logInstallMissingPlugins = function (logs, packages) {
  logSubHeader(logs, 'Installing plugins')
  logArray(logs, packages)
}

const logPluginsFileWarning = function (logs, autoPluginsParent) {
  const filename = basename(autoPluginsParent)
  logErrorSubHeader(logs, `Invalid "${filename}" file`)
  logMessage(
    logs,
    THEME.errorSubHeader(
      `Please rename the "${filename}" file to prevent any conflict with Netlify core logic. This file has been removed from this build.`,
    ),
  )
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
  logPluginsFileWarning,
  logInstallLocalPluginsDeps,
  logInstallFunctionDependencies,
}
