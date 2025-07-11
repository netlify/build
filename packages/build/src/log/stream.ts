import { setTimeout as pSetTimeout } from 'timers/promises'
import type { ChildProcess } from '../plugins/spawn.js'

import { BufferedLogs, logsAreBuffered, Logs } from './logger.js'
import type { OutputFlusher } from './output_flusher.js'

export type StandardStreams = {
  stderr: NodeJS.WriteStream
  stdout: NodeJS.WriteStream
  outputFlusher?: OutputFlusher
}

type LogsListener = (logs: string[], outputFlusher: OutputFlusher | undefined, chunk: Buffer) => void
type LogsListeners = { stderrListener: LogsListener; stdoutListener: LogsListener }

// We try to use `stdio: inherit` because it keeps `stdout/stderr` as `TTY`,
// which solves many problems. However we can only do it in build.command.
// Plugins have several events, so need to be switch on and off instead.
// In buffer mode, `pipe` is necessary.
export const getBuildCommandStdio = function (logs: Logs) {
  if (logsAreBuffered(logs)) {
    return 'pipe'
  }

  return 'inherit'
}

// Add build command output
export const handleBuildCommandOutput = function (
  { stdout: commandStdout, stderr: commandStderr }: { stdout: string; stderr: string },
  logs: Logs,
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

// Start plugin step output
export const pipePluginOutput = function (childProcess: ChildProcess, logs: Logs, standardStreams: StandardStreams) {
  if (!logsAreBuffered(logs)) {
    return streamOutput(childProcess, standardStreams)
  }

  return pushOutputToLogs(childProcess, logs, standardStreams.outputFlusher)
}

// Stop streaming/buffering plugin step output
export const unpipePluginOutput = async function (
  childProcess: ChildProcess,
  logs: Logs,
  listeners: LogsListeners,
  standardStreams: StandardStreams,
) {
  // Let `childProcess` `stdout` and `stderr` flush before stopping redirecting
  await pSetTimeout(0)

  if (!logsAreBuffered(logs)) {
    return unstreamOutput(childProcess, standardStreams)
  }

  unpushOutputToLogs(childProcess, listeners.stdoutListener, listeners.stderrListener)
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
  stdoutListener: LogsListener,
  stderrListener: LogsListener,
) {
  childProcess.stdout?.removeListener('data', stdoutListener)
  childProcess.stderr?.removeListener('data', stderrListener)
}
