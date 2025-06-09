import { createRequire } from 'module'
import { platform } from 'os'
import { fileURLToPath, pathToFileURL } from 'url'
import { promisify } from 'util'

import { trace } from '@opentelemetry/api'
import { type ExecaChildProcess, execaNode } from 'execa'
import { gte, satisfies } from 'semver'

import { FeatureFlags } from '../core/feature_flags.js'
import { addErrorInfo } from '../error/info.js'
import { NetlifyConfig } from '../index.js'
import { BufferedLogs } from '../log/logger.js'
import {
  logIncompatiblePlugins,
  logLoadingIntegration,
  logLoadingPlugins,
  logOutdatedPlugins,
  logRuntime,
} from '../log/messages/compatibility.js'
import { SystemLogger } from '../plugins_core/types.js'
import { isTrustedPlugin } from '../steps/plugin.js'
import { measureDuration } from '../time/main.js'

import { callChild, getEventFromChild } from './ipc.js'
import { PluginsOptions } from './node_version.js'
import { getSpawnInfo } from './options.js'
import { captureStandardError } from './system_log.js'

export type ChildProcess = ExecaChildProcess<string>

const CHILD_MAIN_FILE = fileURLToPath(new URL('child/main.js', import.meta.url))
const pSetTimeout = promisify(setTimeout)
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
  nodeVersion: string
  nodePath: string
  pluginDir: string
  /** The process cwd that is used to spawn the child process */
  buildDir: string
  childEnv: Record<string, string>
  pluginPackageJson: Record<string, string>
  systemLog: SystemLogger
  systemLogFile: number
  featureFlags: FeatureFlags
}) {
  const ctx = trace.getActiveSpan()?.spanContext()

  // the baggage will be passed to the child process when sending the run event
  const args = [
    ...process.argv.filter((arg) => arg.startsWith('--tracing')),
    `--tracing.traceId=${ctx?.traceId}`,
    `--tracing.parentSpanId=${ctx?.spanId}`,
    `--tracing.traceFlags=${ctx?.traceFlags}`,
    `--tracing.enabled=${!!isTrustedPlugin(pluginPackageJson?.name)}`,
  ]

  const nodeOptions: string[] = []

  // the sdk setup is a optional dependency that might not exist
  // only use it if it exists
  try {
    // the --import preloading is only available in node 18.18.0 and above
    // plugins that run on a lower node version will not be able to be instrumented with opentelemetry
    if (gte(nodeVersion, '18.18.0')) {
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
    nodePath,
    nodeOptions,
    execPath: nodePath,
    env: {
      ...childEnv,
      OTEL_SERVICE_NAME: pluginPackageJson?.name,
      OTEL_SERVICE_VERSION: pluginPackageJson?.version,
    },
    extendEnv: false,
    stdio:
      isTrustedPlugin(pluginPackageJson?.name) && systemLogFile
        ? ['pipe', 'pipe', 'pipe', 'ipc', systemLogFile]
        : undefined,
  })
  const readyEvent = 'ready'
  const cleanup = captureStandardError(childProcess, systemLog, readyEvent, featureFlags)

  try {
    await getEventFromChild(childProcess, readyEvent)
    return { childProcess }
  } catch (error) {
    if (featureFlags.netlify_build_plugin_system_log) {
      // Wait for stderr to be flushed.
      await pSetTimeout(0)
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
  logs: BufferedLogs
  verbose: boolean
  childProcesses: { childProcess: ExecaChildProcess }[]
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
  pluginOptions: { packageName, inputs, pluginPath, pluginPackageJson: packageJson = {} },
  netlifyConfig,
  verbose,
}: {
  childProcess: ExecaChildProcess
  pluginOptions: PluginsOptions
  netlifyConfig: NetlifyConfig
  verbose: boolean
  logs: BufferedLogs
}) {
  if (childProcess.connected) {
    // reliable stop tracing inside child processes
    await callChild({
      childProcess,
      eventName: 'shutdown',
      payload: {
        packageName,
        pluginPath,
        inputs,
        packageJson,
        verbose,
        netlifyConfig,
      },
      logs,
      verbose,
    })
    childProcess.disconnect()
  }

  // On Windows with Node 21+, there's a bug where attempting to kill a child process
  // results in an EPERM error. Ignore the error in that case.
  // See: https://github.com/nodejs/node/issues/51766
  // We also disable execa's `forceKillAfterTimeout` in this case
  // which can cause unhandled rejection.
  try {
    childProcess.kill('SIGTERM', {
      forceKillAfterTimeout: platform() === 'win32' && satisfies(process.version, '>=21') ? false : undefined,
    })
  } catch {
    // no-op
  }
}
