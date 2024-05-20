import { stdout, stderr } from 'process'
import { Transform } from 'stream'
import { promisify } from 'util'

import { OutputManagerTransformer, OutputManager } from './output_manager.js'

// TODO: replace with `timers/promises` after dropping Node < 15.0.0
const pSetTimeout = promisify(setTimeout)

// We try to use `stdio: inherit` because it keeps `stdout/stderr` as `TTY`,
// which solves many problems. However we can only do it in build.command.
// Plugins have several events, so need to be switch on and off instead.
// In buffer mode (`logs` not `undefined`), `pipe` is necessary.
export const getBuildCommandStdio = function (logs) {
  if (logs !== undefined) {
    return 'pipe'
  }

  return 'inherit'
}

// Add build command output
export const handleBuildCommandOutput = function ({ stdout: commandStdout, stderr: commandStderr }, logs) {
  if (logs === undefined) {
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
export const pipePluginOutput = function (childProcess, logs, outputManager) {
  if (logs === undefined) {
    return streamOutput(childProcess, outputManager)
  }

  return pushOutputToLogs(childProcess, logs, outputManager)
}

// Stop streaming/buffering plugin step output
export const unpipePluginOutput = async function (childProcess, logs, listeners) {
  // Let `childProcess` `stdout` and `stderr` flush before stopping redirecting
  await pSetTimeout(0)

  if (logs === undefined) {
    return unstreamOutput(childProcess)
  }

  unpushOutputToLogs(childProcess, logs, listeners)
}

// Usually, we stream stdout/stderr because it is more efficient
const streamOutput = function (childProcess, outputManager) {
  if (outputManager) {
    childProcess.stdout.pipe(new OutputManagerTransformer(outputManager)).pipe(stdout)
    childProcess.stderr.pipe(new OutputManagerTransformer(outputManager)).pipe(stderr)

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
const pushOutputToLogs = function (childProcess, logs, outputManager) {
  const stdoutListener = logsListener.bind(null, logs.stdout, outputManager)
  const stderrListener = logsListener.bind(null, logs.stderr, outputManager)

  childProcess.stdout.on('data', stdoutListener)
  childProcess.stderr.on('data', stderrListener)

  return { stdoutListener, stderrListener }
}

const logsListener = function (logs, outputManager, chunk) {
  if (outputManager) {
    outputManager.registerWrite()
  }

  logs.push(chunk.toString().trimEnd())
}

const unpushOutputToLogs = function (childProcess, logs, { stdoutListener, stderrListener }) {
  childProcess.stdout.removeListener('data', stdoutListener)
  childProcess.stderr.removeListener('data', stderrListener)
}
