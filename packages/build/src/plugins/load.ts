import { setTimeout } from 'timers/promises'

import type { PackageJson } from 'read-package-up'

import type { FeatureFlags } from '../core/feature_flags.js'
import { addErrorInfo } from '../error/info.js'
import type { ExtensionMetadata } from '../error/types.js'
import type { Logs } from '../log/logger.js'
import type { SystemLogger } from '../plugins_core/types.js'
import { addPluginLoadErrorStatus } from '../status/load_error.js'
import { type createTimer, measureDuration } from '../time/main.js'
import type { NetlifyConfig } from '../types/config/netlify_config.js'

import { callChild } from './ipc.js'
import type { PluginsLoadedFrom } from './node_version.js'
import type { ChildProcess, LoadedPluginOptions } from './spawn.js'
import { captureStandardError } from './system_log.js'

type Timer = ReturnType<typeof createTimer>

type LoadPluginsOptions = {
  pluginsOptions: LoadedPluginOptions[]
  childProcesses: { childProcess: ChildProcess }[]
  packageJson: PackageJson
  logs: Logs | undefined
  debug: boolean
  verbose: boolean
  netlifyConfig: NetlifyConfig
  featureFlags: FeatureFlags
  systemLog: SystemLogger
}

// Spelled out so the exported declarations don't inline `PackageJson`'s type-fest internals
type PluginStep = {
  event: string
  packageName: string
  loadedFrom: PluginsLoadedFrom | undefined
  origin: string | undefined
  pluginPackageJson: PackageJson
  childProcess: ChildProcess
  extensionMetadata: ExtensionMetadata | undefined
}

// Retrieve all plugins steps
// Can use either a module name or a file path to the plugin.
export const loadPlugins = async function ({
  pluginsOptions,
  childProcesses,
  packageJson,
  timers,
  logs,
  debug,
  verbose,
  netlifyConfig,
  featureFlags,
  systemLog,
}: LoadPluginsOptions & { timers: Timer[] }): Promise<{ pluginsSteps: PluginStep[]; timers: Timer[] }> {
  return pluginsOptions.length === 0
    ? { pluginsSteps: [], timers }
    : // `measureDuration()` loses the return type of `tLoadAllPlugins()`, to which it adds `timers`
      ((await loadAllPlugins({
        pluginsOptions,
        childProcesses,
        packageJson,
        timers,
        logs,
        debug,
        verbose,
        netlifyConfig,
        featureFlags,
        systemLog,
      })) as { pluginsSteps: PluginStep[]; timers: Timer[] })
}

const tLoadAllPlugins = async function ({
  pluginsOptions,
  childProcesses,
  packageJson,
  logs,
  debug,
  verbose,
  netlifyConfig,
  featureFlags,
  systemLog,
}: LoadPluginsOptions): Promise<{ pluginsSteps: PluginStep[] }> {
  const pluginsSteps = await Promise.all(
    pluginsOptions.map((pluginOptions, index) =>
      loadPlugin(pluginOptions, {
        childProcesses,
        index,
        packageJson,
        logs,
        debug,
        verbose,
        netlifyConfig,
        featureFlags,
        systemLog,
      }),
    ),
  )
  const pluginsStepsA = pluginsSteps.flat()
  return { pluginsSteps: pluginsStepsA }
}

// Only performed if there are some plugins
const loadAllPlugins = measureDuration(tLoadAllPlugins, 'load_plugins')

// Retrieve plugin steps for one plugin.
// Do it by executing the plugin `load` event handler.
const loadPlugin = async function (
  {
    packageName,
    pluginPackageJson,
    pluginPackageJson: { version } = {},
    pluginPath,
    inputs,
    loadedFrom,
    origin,
    integration,
  }: LoadedPluginOptions,
  {
    childProcesses,
    index,
    packageJson,
    logs,
    debug,
    verbose,
    netlifyConfig,
    featureFlags,
    systemLog,
  }: Omit<LoadPluginsOptions, 'pluginsOptions'> & { index: number },
): Promise<PluginStep[]> {
  const childProcessEntry = childProcesses[index]
  // `startPlugins()` spawns one child process per plugin, but this keeps the error a missing one used to throw
  if (childProcessEntry === undefined) {
    throw new TypeError("Cannot destructure property 'childProcess' of 'childProcesses[index]' as it is undefined.")
  }
  const { childProcess } = childProcessEntry
  const loadEvent = 'load'
  const cleanup = captureStandardError(childProcess, systemLog, loadEvent, featureFlags)

  try {
    const { events } = await callChild({
      childProcess,
      eventName: 'load',
      payload: { pluginPath, inputs, packageJson, verbose, netlifyConfig },
      logs,
      verbose: false,
    })
    const pluginSteps = events.map((event) => ({
      event,
      packageName,
      loadedFrom,
      origin,
      pluginPackageJson,
      childProcess,
      extensionMetadata: integration,
    }))
    return pluginSteps
  } catch (error) {
    if (featureFlags['netlify_build_plugin_system_log']) {
      // Wait for stderr to be flushed.
      await setTimeout(0)
    }

    addErrorInfo(error, {
      plugin: { packageName, pluginPackageJson, extensionMetadata: integration },
      location: { event: loadEvent, packageName, loadedFrom, origin },
    })
    addPluginLoadErrorStatus({ error, packageName, version, debug })
    throw error
  } finally {
    cleanup()
  }
}
