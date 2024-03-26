import { createRequire } from 'module'
import { fileURLToPath } from 'url'

import { trace } from '@opentelemetry/api'
import { ExecaChildProcess, execaNode } from 'execa'

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
import { isTrustedPlugin } from '../steps/plugin.js'
import { measureDuration } from '../time/main.js'

import { callChild, getEventFromChild } from './ipc.js'
import { PluginsOptions } from './node_version.js'
import { getSpawnInfo } from './options.js'

const CHILD_MAIN_FILE = fileURLToPath(new URL('child/main.js', import.meta.url))

const require = createRequire(import.meta.url)

// Start child processes used by all plugins
// We fire plugins through child processes so that:
//  - each plugin is sandboxed, e.g. cannot access/modify its parent `process`
//    (for both security and safety reasons)
//  - logs can be buffered which allows manipulating them for log shipping,
//    transforming and parallel plugins
const tStartPlugins = async function ({ pluginsOptions, buildDir, childEnv, logs, debug, quiet, systemLogFile }) {
  if (!quiet) {
    logRuntime(logs, pluginsOptions)
    logLoadingPlugins(logs, pluginsOptions, debug)
    logLoadingIntegration(logs, pluginsOptions)
  }

  logOutdatedPlugins(logs, pluginsOptions)
  logIncompatiblePlugins(logs, pluginsOptions)

  const childProcesses = await Promise.all(
    pluginsOptions.map(({ pluginDir, nodePath, pluginPackageJson }) =>
      startPlugin({ pluginDir, nodePath, buildDir, childEnv, systemLogFile, pluginPackageJson }),
    ),
  )
  return { childProcesses }
}

export const startPlugins = measureDuration(tStartPlugins, 'start_plugins')

const startPlugin = async function ({ pluginDir, nodePath, buildDir, childEnv, systemLogFile, pluginPackageJson }) {
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
    const entry = require.resolve('@netlify/opentelemetry-sdk-setup/bin.js')
    nodeOptions.push('--import', entry)
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

  try {
    await getEventFromChild(childProcess, 'ready')
    return { childProcess }
  } catch (error) {
    const spawnInfo = getSpawnInfo()
    addErrorInfo(error, spawnInfo)
    throw error
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
  childProcess.kill()
}
