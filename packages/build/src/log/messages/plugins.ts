import type { PluginList } from '../../plugins/list.js'
import { BufferedLogs, log, logArray, logSubHeader, logWarning } from '../logger.js'

export const logPluginsFetchError = function (logs: BufferedLogs | undefined, message: string): void {
  logWarning(
    logs,
    `
Warning: could not fetch latest plugins list. Plugins versions might not be the latest.
${message}`,
  )
}

export const logPluginsList = function ({
  pluginsList,
  debug,
  logs,
}: {
  pluginsList: PluginList
  logs: BufferedLogs | undefined
  debug?: boolean
}): void {
  if (!debug) {
    return
  }

  const pluginsListArray = Object.entries(pluginsList)
    .map(([packageName, versions]) => `${packageName}@${versions[0].version}`)
    .sort()

  logSubHeader(logs, 'Available plugins')
  logArray(logs, pluginsListArray)
}

export const logFailPluginWarning = function (methodName, event) {
  logWarning(
    undefined,
    `Plugin error: since "${event}" happens after deploy, the build has already succeeded and cannot fail anymore. This plugin should either:
- use utils.build.failPlugin() instead of utils.build.${methodName}() to clarify that the plugin failed, but not the build.
- use "onPostBuild" instead of "${event}" if the plugin failure should make the build fail too. Please note that "onPostBuild" (unlike "${event}") happens before deploy.`,
  )
}

export const logDeploySuccess = function (logs?: BufferedLogs) {
  log(logs, 'Site deploy was successfully initiated')
}
