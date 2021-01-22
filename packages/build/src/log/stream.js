'use strict'

const { stdout, stderr } = require('process')
const { promisify } = require('util')

// TODO: replace with `timers/promises` after dropping Node < 15.0.0
const pSetTimeout = promisify(setTimeout)

// We try to use `stdio: inherit` because it keeps `stdout/stderr` as `TTY`,
// which solves many problems. However we can only do it in build.command.
// Plugins have several events, so need to be switch on and off instead.
// In buffer mode (`logs` not `undefined`), `pipe` is necessary.
const getBuildCommandStdio = function (logs) {
  if (logs !== undefined) {
    return 'pipe'
  }

  return 'inherit'
}

// Add build command output
const handleBuildCommandOutput = function ({ stdout: commandStdout, stderr: commandStderr }, logs) {
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

// Start plugin command output
const pipePluginOutput = function (childProcess, logs) {
  if (logs === undefined) {
    return streamOutput(childProcess)
  }

  return pushOutputToLogs(childProcess, logs)
}

// Stop streaming/buffering plugin command output
const unpipePluginOutput = async function (childProcess, logs, listeners) {
  // Let `childProcess` `stdout` and `stderr` flush before stopping redirecting
  await pSetTimeout(0)

  if (logs === undefined) {
    return unstreamOutput(childProcess)
  }

  unpushOutputToLogs(childProcess, logs, listeners)
}

// Usually, we stream stdout/stderr because it is more efficient
const streamOutput = function (childProcess) {
  childProcess.stdout.pipe(stdout)
  childProcess.stderr.pipe(stderr)
}

const unstreamOutput = function (childProcess) {
  childProcess.stdout.unpipe(stdout)
  childProcess.stderr.unpipe(stderr)
}

// In tests, we push to the `logs` array instead
const pushOutputToLogs = function (childProcess, logs) {
  const stdoutListener = logsListener.bind(null, logs.stdout)
  const stderrListener = logsListener.bind(null, logs.stderr)
  childProcess.stdout.on('data', stdoutListener)
  childProcess.stderr.on('data', stderrListener)
  return { stdoutListener, stderrListener }
}

const logsListener = function (logs, chunk) {
  logs.push(chunk.toString().trimRight())
}

const unpushOutputToLogs = function (childProcess, logs, { stdoutListener, stderrListener }) {
  childProcess.stdout.removeListener('data', stdoutListener)
  childProcess.stderr.removeListener('data', stderrListener)
}

module.exports = {
  getBuildCommandStdio,
  handleBuildCommandOutput,
  pipePluginOutput,
  unpipePluginOutput,
}
