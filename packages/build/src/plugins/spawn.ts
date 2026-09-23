import { createRequire } from 'module'
import { platform } from 'os'
import { setTimeout } from 'timers/promises'
import { fileURLToPath, pathToFileURL } from 'url'

import { trace } from '@opentelemetry/api'
import { type ExecaChildProcess, execaNode } from 'execa'
import type { PackageJson } from 'read-package-up'
import { gte, satisfies } from 'semver'

import { FeatureFlags } from '../core/feature_flags.js'
import { addErrorInfo } from '../error/info.js'
import type { ExtensionMetadata } from '../error/types.js'
import { NetlifyConfig } from '../index.js'
import type { Logs } from '../log/logger.js'
import {
  logIncompatiblePlugins,
  logLoadingIntegration,
  logLoadingPlugins,
  logOutdatedPlugins,
  logRuntime,
} from '../log/messages/compatibility.js'
import { SystemLogger } from '../plugins_core/types.js'
import { measureDuration } from '../time/main.js'

import { callChild, getEventFromChild } from './ipc.js'
import { PluginsOptions } from './node_version.js'
import { getSpawnInfo } from './options.js'
import { captureStandardError } from './system_log.js'
import { isTrustedPlugin } from './trusted.js'

export type ChildProcess = ExecaChildProcess

// What `getPluginsOptions()` returns
export type LoadedPluginOptions = PluginsOptions & {
  pluginPath: string
  pluginDir: string
  packageDir?: string | undefined
  pluginPackageJson: PackageJson
  inputs: Record<string, unknown>
  // Extensions' build plugins have no Node.js version from `addPluginsNodeVersion()`
  nodePath?: string | undefined
  nodeVersion?: string | undefined
  integration?: ExtensionMetadata | undefined
}

const CHILD_MAIN_FILE = fileURLToPath(new URL('child/main.js', import.meta.url))
const require = createRequire(import.meta.url)

// Start child processes used by all plugins
// We fire plugins through child processes so that:
//  - each plugin is sandboxed, e.g. cannot access/modify its parent `process`
//    (for both security and safety reasons)
//  - logs can be buffered which allows manipulating them for log shipping,
//    transforming and parallel plugins
const tStartPlugins = async function ({
  pluginsOptions,
  buildDir,
  childEnv,
  logs,
  debug,
  quiet,
  systemLog,
  systemLogFile,
  featureFlags,
}: {
  pluginsOptions: LoadedPluginOptions[]
  buildDir: string
  childEnv: NodeJS.ProcessEnv
  logs: Logs | undefined
  debug: boolean
  quiet: boolean | undefined
  systemLog: SystemLogger
  systemLogFile: number | undefined
  featureFlags: FeatureFlags
}) {
  if (!quiet) {
    logRuntime(logs, pluginsOptions)
    logLoadingPlugins(logs, pluginsOptions, debug)
    logLoadingIntegration(logs, pluginsOptions)
  }

  logOutdatedPlugins(logs, pluginsOptions)
  logIncompatiblePlugins(logs, pluginsOptions)

  const childProcesses = await Promise.all(
    pluginsOptions.map(({ pluginDir, nodePath, nodeVersion, pluginPackageJson }) =>
      startPlugin({
        pluginDir,
        nodePath,
        nodeVersion,
        buildDir,
        childEnv,
        systemLog,
        systemLogFile,
        pluginPackageJson,
        featureFlags,
      }),
    ),
  )
  return { childProcesses }
}

export const startPlugins = measureDuration(tStartPlugins, 'start_plugins')

const startPlugin = async function ({
  pluginDir,
  nodeVersion,
  nodePath,
  buildDir,
  childEnv,
  systemLog,
  systemLogFile,
  pluginPackageJson,
  featureFlags,
}: {
  nodeVersion: string | undefined
  nodePath: string | undefined
  pluginDir: string
  /** The process cwd that is used to spawn the child process */
  buildDir: string
  childEnv: NodeJS.ProcessEnv
  pluginPackageJson: PackageJson
  systemLog: SystemLogger
  systemLogFile: number | undefined
  featureFlags: FeatureFlags
}) {
  const ctx = trace.getActiveSpan()?.spanContext()

  // the baggage will be passed to the child process when sending the run event
  const args = [
    ...process.argv.filter((arg) => arg.startsWith('--tracing')),
    `--tracing.traceId=${String(ctx?.traceId)}`,
    `--tracing.parentSpanId=${String(ctx?.spanId)}`,
    `--tracing.traceFlags=${String(ctx?.traceFlags)}`,
    `--tracing.enabled=${String(!!isTrustedPlugin(pluginPackageJson.name))}`,
  ]

  const nodeOptions: string[] = []

  // the sdk setup is a optional dependency that might not exist
  // only use it if it exists
  try {
    // the --import preloading is only available in node 18.18.0 and above
    // plugins that run on a lower node version will not be able to be instrumented with opentelemetry
    // `gte()` throws on an `undefined` version, which this `catch` ignores
    if (nodeVersion !== undefined && gte(nodeVersion, '18.18.0')) {
      const entry = require.resolve('@netlify/opentelemetry-sdk-setup/bin.js')
      // on windows only file:// urls are allowed
      nodeOptions.push('--import', pathToFileURL(entry).toString())
    }
  } catch {
    // noop
  }

  const childProcess = execaNode(CHILD_MAIN_FILE, args, {
    cwd: buildDir,
    preferLocal: true,
    localDir: pluginDir,
    // `execa` treats `undefined` options like missing ones
    ...(nodePath === undefined ? {} : { nodePath, execPath: nodePath }),
    nodeOptions,
    env: {
      ...childEnv,
      OTEL_SERVICE_NAME: pluginPackageJson.name,
      OTEL_SERVICE_VERSION: pluginPackageJson.version,
    },
    extendEnv: false,
    ...(isTrustedPlugin(pluginPackageJson.name) && systemLogFile
      ? { stdio: ['pipe', 'pipe', 'pipe', 'ipc', systemLogFile] }
      : {}),
  })
  const readyEvent = 'ready'
  const cleanup = captureStandardError(childProcess, systemLog, readyEvent, featureFlags)

  try {
    await getEventFromChild(childProcess, readyEvent)
    return { childProcess }
  } catch (error) {
    if (featureFlags['netlify_build_plugin_system_log']) {
      // Wait for stderr to be flushed.
      await setTimeout(0)
    }

    const spawnInfo = getSpawnInfo()
    addErrorInfo(error, spawnInfo)
    throw error
  } finally {
    cleanup()
  }
}

// Stop all plugins child processes
export const stopPlugins = async function ({
  childProcesses,
  logs,
  verbose,
  pluginOptions,
  netlifyConfig,
}: {
  logs: Logs | undefined
  verbose: boolean
  childProcesses: { childProcess: ChildProcess }[]
  pluginOptions: PluginsOptions[]
  netlifyConfig: NetlifyConfig
}) {
  await Promise.all(
    childProcesses.map(({ childProcess }, index) => {
      return stopPlugin({ childProcess, verbose, logs, pluginOptions: pluginOptions[index], netlifyConfig })
    }),
  )
}

const stopPlugin = async function ({
  childProcess,
  logs,
  pluginOptions,
  netlifyConfig,
  verbose,
}: {
  childProcess: ChildProcess
  // `childProcesses` has one entry per plugin, but this keeps the error a missing one used to throw
  pluginOptions: PluginsOptions | undefined
  netlifyConfig: NetlifyConfig
  verbose: boolean
  logs: Logs | undefined
}) {
  if (pluginOptions === undefined) {
    throw new TypeError("Cannot read properties of undefined (reading 'packageName')")
  }

  const { packageName, inputs, pluginPath, pluginPackageJson: packageJson = {} } = pluginOptions
  if (childProcess.connected) {
    await shutdownPlugin({
      childProcess,
      payload: { packageName, pluginPath, inputs, packageJson, verbose, netlifyConfig },
      logs,
      verbose,
    })
  }

  // On Windows with Node 21+, there's a bug where attempting to kill a child process
  // results in an EPERM error. Ignore the error in that case.
  // See: https://github.com/nodejs/node/issues/51766
  // We also disable execa's `forceKillAfterTimeout` in this case
  // which can cause unhandled rejection.
  try {
    // `execa` treats an `undefined` `forceKillAfterTimeout` like a missing one
    childProcess.kill(
      'SIGTERM',
      platform() === 'win32' && satisfies(process.version, '>=21') ? { forceKillAfterTimeout: false } : {},
    )
  } catch {
    // no-op
  }
}

// Separate from `stopPlugin()` so the `connected` check after `await` isn't narrowed by the one before it
const shutdownPlugin = async function ({
  childProcess,
  payload,
  logs,
  verbose,
}: {
  childProcess: ChildProcess
  payload: Record<string, unknown>
  logs: Logs | undefined
  verbose: boolean
}) {
  try {
    // reliable stop tracing inside child processes
    await callChild({ childProcess, eventName: 'shutdown', payload, logs, verbose })
  } catch {
    // The child process may exit before responding, e.g. when it already
    // failed. It is being terminated anyway, so ignore the error
  } finally {
    if (childProcess.connected) {
      childProcess.disconnect()
    }
  }
}
