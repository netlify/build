import { log, logArray, logSubHeader } from '../logger.js'

export const logInstallMissingPlugins = function (logs, packages) {
  logSubHeader(logs, 'Installing plugins')
  logArray(logs, packages)
}

export const logInstallLocalPluginsDeps = function (logs, localPluginsOptions) {
  const packages = localPluginsOptions.map(getPackageName)
  logSubHeader(logs, 'Installing local plugins dependencies')
  logArray(logs, packages)
}

export const logInstallFunctionDependencies = function () {
  log(undefined, 'Installing functions dependencies')
}

const getPackageName = function ({ packageName }) {
  return packageName
}
