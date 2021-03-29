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
  return !IGNORED_COMMANDS.some((ignoredCommand) => command.includes(ignoredCommand))
}

const IGNORED_COMMANDS = [
  // buildbot's main Bash script
  '/opt/build-bin/build',
  // `@netlify/build` binary itself
  'netlify-build',
  // Plugin child processes spawned by @netlify/build
  '@netlify/build',
  // Any command internal to @netlify/build. Includes:
  //  - `esbuild` uses a Go child process which is not always terminated after
  //    Functions bundling has ended
  //  - Plugin child processes. Those are terminated by the parent process.
  //    However, in tests, builds are run concurrently, so other builds might
  //    have those child processes running.
  '/netlify/build/node_modules',
  '/packages/build/',

  // Shown for parent processes with currently running child processes.
  // Happens on `ps` itself.
  'defunct',

  // Processes often left running. We should report those but don't because of
  // how common those are in production builds
  'gatsby-telemetry',
  'jest-worker',
  'broccoli-babel-transpiler',
]

module.exports = { warnOnLingeringProcesses }
