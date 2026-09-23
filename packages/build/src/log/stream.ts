import { setTimeout } from 'timers/promises'

import type { ChildProcess } from '../plugins/spawn.js'

import { BufferedLogs, logsAreBuffered, Logs } from './logger.js'
import type { OutputFlusher } from './output_flusher.js'

export type StandardStreams = {
  stderr: NodeJS.WriteStream
  stdout: NodeJS.WriteStream
  outputFlusher?: OutputFlusher
}

type LogsListener = (logs: string[], outputFlusher: OutputFlusher | undefined, chunk: Buffer) => void
type ChunkListener = (chunk: Buffer) => void
type LogsListeners = { stderrListener: ChunkListener; stdoutListener: ChunkListener }

// We try to use `stdio: inherit` because it keeps `stdout/stderr` as `TTY`,
// which solves many problems. However we can only do it in build.command.
// Plugins have several events, so need to be switch on and off instead.
// In buffer mode, `pipe` is necessary.
export const getBuildCommandStdio = function (logs: Logs | undefined) {
  if (logsAreBuffered(logs)) {
    return 'pipe'
  }

  return 'inherit'
}

// Add build command output
export const handleBuildCommandOutput = function (
  { stdout: commandStdout, stderr: commandStderr }: { stdout: string; stderr: string },
  logs: Logs | undefined,
) {
  if (!logsAreBuffered(logs)) {
    return
  }

  pushBuildCommandOutput(commandStdout, logs.stdout)
  pushBuildCommandOutput(commandStderr, logs.stderr)
}

const pushBuildCommandOutput = function (output: string, logsArray: string[]) {
  if (output === '') {
    return
  }

  logsArray.push(output)
}

const pipedPluginProcesses = new WeakMap<ChildProcess, ReturnType<typeof pipePluginOutput>>()

// Start plugin step output
export const pipePluginOutput = function (
  childProcess: ChildProcess,
  logs: Logs | undefined,
  standardStreams: StandardStreams,
): LogsListeners | undefined {
  if (pipedPluginProcesses.has(childProcess)) {
    return pipedPluginProcesses.get(childProcess)
  }

  let listeners: LogsListeners | undefined
  if (logsAreBuffered(logs)) {
    listeners = pushOutputToLogs(childProcess, logs, standardStreams.outputFlusher)
  } else {
    streamOutput(childProcess, standardStreams)
  }

  pipedPluginProcesses.set(childProcess, listeners)

  return listeners
}

// Stop streaming/buffering plugin step output
export const unpipePluginOutput = async function (
  childProcess: ChildProcess,
  logs: Logs | undefined,
  listeners: LogsListeners | undefined,
  standardStreams: StandardStreams,
) {
  // Let `childProcess` `stdout` and `stderr` flush before stopping redirecting
  await setTimeout(0)

  if (logsAreBuffered(logs)) {
    if (listeners !== undefined) {
      unpushOutputToLogs(childProcess, listeners.stdoutListener, listeners.stderrListener)
    }
  } else {
    unstreamOutput(childProcess, standardStreams)
  }

  pipedPluginProcesses.delete(childProcess)
}

// Usually, we stream stdout/stderr because it is more efficient
const streamOutput = function (childProcess: ChildProcess, standardStreams: StandardStreams) {
  childProcess.stdout?.pipe(standardStreams.stdout)
  childProcess.stderr?.pipe(standardStreams.stderr)
}

const unstreamOutput = function (childProcess: ChildProcess, standardStreams: StandardStreams) {
  childProcess.stdout?.unpipe(standardStreams.stdout)
  childProcess.stderr?.unpipe(standardStreams.stderr)
}

// In tests, we push to the `logs` array instead
const pushOutputToLogs = function (
  childProcess: ChildProcess,
  logs: BufferedLogs,
  outputFlusher?: OutputFlusher,
): LogsListeners {
  const stdoutListener = logsListener.bind(null, logs.stdout, outputFlusher)
  const stderrListener = logsListener.bind(null, logs.stderr, outputFlusher)

  childProcess.stdout?.on('data', stdoutListener)
  childProcess.stderr?.on('data', stderrListener)

  return { stdoutListener, stderrListener }
}

const logsListener: LogsListener = function (logs, outputFlusher, chunk) {
  if (outputFlusher) {
    outputFlusher.flush()
  }

  logs.push(chunk.toString().trimEnd())
}

const unpushOutputToLogs = function (
  childProcess: ChildProcess,
  stdoutListener: ChunkListener,
  stderrListener: ChunkListener,
) {
  childProcess.stdout?.removeListener('data', stdoutListener)
  childProcess.stderr?.removeListener('data', stderrListener)
}
