'use strict'

const { log, logArray, logSubHeader } = require('../logger')

const logInstallMissingPlugins = function (logs, packages) {
  logSubHeader(logs, 'Installing plugins')
  logArray(logs, packages)
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
  logInstallLocalPluginsDeps,
  logInstallFunctionDependencies,
}
