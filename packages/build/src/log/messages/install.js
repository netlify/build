import { isRuntime } from '../../utils/runtime.js'
import { log, logArray, logSubHeader } from '../logger.js'

export const logInstallMissingPlugins = function (logs, missingPlugins, packages) {
  const plugins = missingPlugins.filter((pkg) => !isRuntime(pkg))

  if (plugins.length !== 0) {
    logSubHeader(logs, 'Installing plugins')
    logArray(logs, packages)
  }
}

export const logInstallIntegrations = function (logs, integrations) {
  if (integrations.length === 0) {
    return
  }

  logSubHeader(logs, 'Installing extensions')
  logArray(
    logs,
    integrations.map((integration) => integration.slug),
  )
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
