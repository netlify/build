'use strict'

const psList = require('ps-list')

const { logLingeringProcesses } = require('../log/messages/core')

// Print a warning when some build processes are still running.
// This is only run in the buildbot at the moment (Linux only).
const warnOnLingeringProcesses = async function ({ mode, logs, testOpts: { silentLingeringProcesses = false } }) {
  if (mode !== 'buildbot' || silentLingeringProcesses) {
    return
  }

  const processes = await psList()

  const commands = processes.map(getCommand).filter(isNotIgnoredCommand)

  if (commands.length === 0) {
    return
  }

  logLingeringProcesses(logs, commands)
}

// `cmd` is only available on Unix. Unlike `name`, it includes the arguments.
const getCommand = function ({ name, cmd = name }) {
  return cmd
}

// We ignore any command known to be internal to the buildbot.
// We also ignore commands known not to complete properly in builds if they are
// widely used.
const isNotIgnoredCommand = function (command) {
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
  'defunct',
  '[build]',
  /buildbot.*\[node]/,

  // buildbot's main Bash script
  '/opt/build-bin/build',
  // `@netlify/build` binary itself
  'netlify-build',
  // Plugin child processes spawned by @netlify/build
  '@netlify/build',

  // Processes often left running. We should report those but don't because of
  // how common those are in production builds
  'gatsby-telemetry',
  'jest-worker',
  'broccoli-babel-transpiler',
]

module.exports = { warnOnLingeringProcesses }
