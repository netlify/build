import { stdout, stderr } from 'process'
import { promisify } from 'util'

import { logsAreBuffered } from './logger.js'
import { OutputFlusherTransform } from './output_flusher.js'

// TODO: replace with `timers/promises` after dropping Node < 15.0.0
const pSetTimeout = promisify(setTimeout)

// We try to use `stdio: inherit` because it keeps `stdout/stderr` as `TTY`,
// which solves many problems. However we can only do it in build.command.
// Plugins have several events, so need to be switch on and off instead.
// In buffer mode, `pipe` is necessary.
export const getBuildCommandStdio = function (logs) {
  if (logsAreBuffered(logs)) {
    return 'pipe'
  }

  return 'inherit'
}

// Add build command output
export const handleBuildCommandOutput = function ({ stdout: commandStdout, stderr: commandStderr }, logs) {
  if (!logsAreBuffered(logs)) {
    return
  }

  pushBuildCommandOutput(commandStdout, logs.stdout)
  pushBuildCommandOutput(commandStderr, logs.stderr)
}

const pushBuildCommandOutput = function (output, logsArray) {
  if (output === '') {
    return
  }

  logsArray.push(output)
}

// Start plugin step output
export const pipePluginOutput = function (childProcess, logs, outputFlusher) {
  if (!logsAreBuffered(logs)) {
    return streamOutput(childProcess, outputFlusher)
  }

  return pushOutputToLogs(childProcess, logs, outputFlusher)
}

// Stop streaming/buffering plugin step output
export const unpipePluginOutput = async function (childProcess, logs, listeners) {
  // Let `childProcess` `stdout` and `stderr` flush before stopping redirecting
  await pSetTimeout(0)

  if (!logsAreBuffered(logs)) {
    return unstreamOutput(childProcess)
  }

  unpushOutputToLogs(childProcess, logs, listeners)
}

// Usually, we stream stdout/stderr because it is more efficient
const streamOutput = function (childProcess, outputFlusher) {
  if (outputFlusher) {
    childProcess.stdout.pipe(new OutputFlusherTransform(outputFlusher)).pipe(stdout)
    childProcess.stderr.pipe(new OutputFlusherTransform(outputFlusher)).pipe(stderr)

    return
  }

  childProcess.stdout.pipe(stdout)
  childProcess.stderr.pipe(stderr)
}

const unstreamOutput = function (childProcess) {
  childProcess.stdout.unpipe(stdout)
  childProcess.stderr.unpipe(stderr)
}

// In tests, we push to the `logs` array instead
const pushOutputToLogs = function (childProcess, logs, outputFlusher) {
  const stdoutListener = logsListener.bind(null, logs.stdout, outputFlusher)
  const stderrListener = logsListener.bind(null, logs.stderr, outputFlusher)

  childProcess.stdout.on('data', stdoutListener)
  childProcess.stderr.on('data', stderrListener)

  return { stdoutListener, stderrListener }
}

const logsListener = function (logs, outputFlusher, chunk) {
  if (outputFlusher) {
    outputFlusher.flush()
  }

  logs.push(chunk.toString().trimEnd())
}

const unpushOutputToLogs = function (childProcess, logs, { stdoutListener, stderrListener }) {
  childProcess.stdout.removeListener('data', stdoutListener)
  childProcess.stderr.removeListener('data', stderrListener)
}
