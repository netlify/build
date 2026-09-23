import { isRuntime } from '../../utils/runtime.js'
import { type Logs, log, logArray, logSubHeader } from '../logger.js'

type PluginOption = { packageName: string }

export const logInstallMissingPlugins = function (
  logs: Logs | undefined,
  missingPlugins: readonly PluginOption[],
  packages: readonly string[],
) {
  const plugins = missingPlugins.filter((pkg) => !isRuntime(pkg))

  if (plugins.length !== 0) {
    logSubHeader(logs, 'Installing plugins')
    logArray(logs, packages)
  }
}

export const logInstallIntegrations = function (logs: Logs | undefined, integrations: readonly { slug: string }[]) {
  if (integrations.length === 0) {
    return
  }

  logSubHeader(logs, 'Installing extensions')
  logArray(
    logs,
    integrations.map((integration) => integration.slug),
  )
}

export const logInstallLocalPluginsDeps = function (
  logs: Logs | undefined,
  localPluginsOptions: readonly PluginOption[],
) {
  const packages = localPluginsOptions.map(getPackageName)
  logSubHeader(logs, 'Installing local plugins dependencies')
  logArray(logs, packages)
}

export const logInstallFunctionDependencies = function () {
  log(undefined, 'Installing functions dependencies')
}

const getPackageName = function ({ packageName }: PluginOption) {
  return packageName
}
