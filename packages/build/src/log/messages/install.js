import { isRuntime } from '../../utils/runtime.js'
import { log, logArray, logSubHeader } from '../logger.js'

export const logInstallMissingPlugins = function (logs, packages) {
  const runtimes = packages.filter((pkg) => isRuntime(pkg))
  const plugins = packages.filter((pkg) => !isRuntime(pkg))

  if (plugins.length !== 0) {
    logSubHeader(logs, 'Installing plugins')
    logArray(logs, packages)
  }

  if (runtimes.length !== 0) {
    const [nextRuntime] = runtimes

    logSubHeader(logs, `Using Next.js Runtime - v${nextRuntime.pluginPackageJson.version}`)
  }
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
