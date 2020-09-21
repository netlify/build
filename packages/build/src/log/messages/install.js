const { log, logMessage, logArray, logSubHeader, logErrorSubHeader } = require('../logger')
const { THEME } = require('../theme')

const logInstallMissingPlugins = function(logs, packages) {
  logSubHeader(logs, 'Installing plugins')
  logArray(logs, packages)
}

const logMissingPluginsWarning = function(logs, packages) {
  logErrorSubHeader(logs, 'Missing plugins')
  logMessage(
    logs,
    THEME.errorSubHeader(
      `The following plugins should be installed either via the Netlify app or as a "dependency" inside your project's "package.json"`,
    ),
  )
  logArray(logs, packages, { color: THEME.errorSubHeader })
}

const logInstallLocalPluginsDeps = function(logs, localPluginsOptions) {
  const packages = localPluginsOptions.map(getPackage)
  logSubHeader(logs, 'Installing local plugins dependencies')
  logArray(logs, packages)
}

const logInstallFunctionDependencies = function() {
  log(undefined, 'Installing functions dependencies')
}

const getPackage = function({ package }) {
  return package
}

module.exports = {
  logInstallMissingPlugins,
  logMissingPluginsWarning,
  logInstallLocalPluginsDeps,
  logInstallFunctionDependencies,
}
