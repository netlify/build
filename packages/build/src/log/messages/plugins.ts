import type { PluginList } from '../../plugins/list.js'
import { type Logs, log, logArray, logSubHeader, logWarning } from '../logger.js'

export const logPluginsFetchError = function (logs: Logs | undefined, message: string): void {
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
  logs: Logs | undefined
  debug?: boolean | undefined
}): void {
  if (!debug) {
    return
  }

  // `normalizePluginsList()` never leaves `versions` empty
  const pluginsListArray = Object.entries(pluginsList)
    .map(([packageName, versions]) => `${packageName}@${String(versions[0]?.version)}`)
    .sort()

  logSubHeader(logs, 'Available plugins')
  logArray(logs, pluginsListArray)
}

export const logFailPluginWarning = function (methodName: string, event: string) {
  logWarning(
    undefined,
    `Plugin error: since "${event}" happens after deploy, the build has already succeeded and cannot fail anymore. This plugin should either:
- use utils.build.failPlugin() instead of utils.build.${methodName}() to clarify that the plugin failed, but not the build.
- use "onPostBuild" instead of "${event}" if the plugin failure should make the build fail too. Please note that "onPostBuild" (unlike "${event}") happens before deploy.`,
  )
}

export const logDeploySuccess = function (logs?: Logs) {
  log(logs, 'Site deploy was successfully initiated')
}
