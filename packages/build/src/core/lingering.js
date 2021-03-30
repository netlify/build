'use strict'

const { kill } = require('process')
const { promisify } = require('util')

const psList = require('ps-list')

const { logLingeringProcesses } = require('../log/messages/core')

const pSetTimeout = promisify(setTimeout)

// Print a warning when some build processes are still running.
// We cannot rely on using the process tree:
//  - This is because it is impossible to know whether a process was a child of
//    of another once its parent process has exited. When that happens, the s
//    child becomes inherited by `init`, changing its `ppid`. The information
//    about the original parent is then lost.
//  - The only way to implement this would be to repeatedly list processes as
//    the build command is ongoing. However, this would fail to detect processes
//    spawned just before the build commands ends.
// We cannot list processes before and after the build command and use the
// difference.
//  - This is because other processes (unrelated to @netlify/build) might be
//    running at the same time. This includes OS background processes.
// Therefore, we run this in a controlled environment only (the buildbot) and
// exclude specific processes manually. This is a lesser evil, although still
// quite hacky.
const warnOnLingeringProcesses = async function ({
  mode,
  logs,
  testOpts: { silentLingeringProcesses = false, terminateLingeringProcesses = true },
}) {
  if (mode !== 'buildbot' || silentLingeringProcesses) {
    return
  }

  const processes = await psList()

  const lingeringProcesses = processes.map(normalizeProcess).filter(isNotIgnoredProcess)

  if (lingeringProcesses.length === 0) {
    return
  }

  terminateProcesses(lingeringProcesses, terminateLingeringProcesses)

  const commands = lingeringProcesses.map(getCommand)
  logLingeringProcesses(logs, commands)
}

// `cmd` is only available on Unix. Unlike `name`, it includes the arguments.
const normalizeProcess = function ({ pid, name, cmd: command = name }) {
  return { pid, command }
}

const getCommand = function ({ command }) {
  return command
}

// We ignore any command known to be internal to the buildbot.
// We also ignore commands known not to complete properly in builds if they are
// widely used.
const isNotIgnoredProcess = function ({ command }) {
  return !IGNORED_COMMANDS.some((ignoredCommand) => matchesIgnoredCommand(command, ignoredCommand))
}

const matchesIgnoredCommand = function (command, ignoredCommand) {
  if (typeof ignoredCommand === 'string') {
    return command.includes(ignoredCommand)
  }

  return ignoredCommand.test(command)
}

const IGNORED_COMMANDS = [
  // TODO: Those can most likely be removed
  'ps',
  'grep',
  'bash',

  // Internal buildbot commands
  '[build]',
  /buildbot.*\[node]/,
  // buildbot's main Bash script
  '/opt/build-bin/build',
  // `@netlify/build` binary itself
  'netlify-build',
  // Plugin child processes spawned by @netlify/build
  '@netlify/build',
  // Shown for parent processes with currently running child processes.
  // Happens on `ps` itself.
  'defunct',

  // Processes often left running. We should report those but don't because of
  // how common those are in production builds
  'gatsby-telemetry',
  'jest-worker',
  'broccoli-babel-transpiler',
]

// Try to do a graceful termination if possible
const terminateProcesses = function (lingeringProcesses, terminateLingeringProcesses) {
  if (!terminateLingeringProcesses) {
    return
  }

  lingeringProcesses.forEach(terminateProcess)
}

const terminateProcess = async function ({ pid }) {
  safeKill(pid, 'SIGTERM')
  await pSetTimeout(TERMINATION_GRACEFUL_PERIOD)
  safeKill(pid, 'SIGKILL')
}

// This can throw if the process does not exist anymore
const safeKill = function (pid, signal) {
  try {
    kill(pid, signal)
  } catch (error) {}
}

// This adds build minutes, so this cannot be too large
const TERMINATION_GRACEFUL_PERIOD = 1e3

module.exports = { warnOnLingeringProcesses }
