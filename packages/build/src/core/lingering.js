import psList from 'ps-list'

import { logLingeringProcesses } from '../log/messages/core.js'

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
export const warnOnLingeringProcesses = async function ({
  mode,
  logs,
  testOpts: { silentLingeringProcesses = false },
}) {
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
