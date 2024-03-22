import { fileURLToPath } from 'url'

import { trace } from '@opentelemetry/api'
import { ExecaChildProcess, execaNode } from 'execa'

import { addErrorInfo } from '../error/info.js'
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
import { getSpawnInfo } from './options.js'

const CHILD_MAIN_FILE = fileURLToPath(new URL('child/main.js', import.meta.url))

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
  ]

  const childProcess = execaNode(CHILD_MAIN_FILE, args, {
    cwd: buildDir,
    preferLocal: true,
    localDir: pluginDir,
    nodePath,
    // make sure we don't pass build's node cli properties for now (e.g. --import)
    nodeOptions: [],
    execPath: nodePath,
    env: childEnv,
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
}: {
  logs: BufferedLogs
  verbose: boolean
  childProcesses: { childProcess: ExecaChildProcess }[]
}) {
  await Promise.all(childProcesses.map(({ childProcess }) => stopPlugin({ childProcess, verbose, logs })))
}

const stopPlugin = async function ({
  childProcess,
  logs,
  verbose,
}: {
  childProcess: ExecaChildProcess
  verbose: boolean
  logs: BufferedLogs
}) {
  // reliable stop tracing inside child processes
  await callChild({
    childProcess,
    eventName: 'shutdown',
    payload: {},
    logs,
    verbose,
  })

  if (childProcess.connected) {
    childProcess.disconnect()
  }
  childProcess.kill()
}
