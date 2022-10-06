import process from 'process'

import { execa, execaCommand } from 'execa'

// Run a command, with arguments being an array
export const run = function (file, args, options) {
  const [argsA, optionsA] = parseArgs(args, options)
  const optionsB = { ...DEFAULT_OPTIONS, ...optionsA }
  const childProcess = execa(file, argsA, optionsB)
  redirectOutput(childProcess, optionsB)
  return childProcess
}

// Run a command, with file + arguments being a single string
export const runCommand = function (command, options) {
  const optionsA = { ...DEFAULT_OPTIONS, ...options }
  const childProcess = execaCommand(command, optionsA)
  redirectOutput(childProcess, optionsA)
  return childProcess
}

// Both `args` and `options` are optional
const parseArgs = function (args, options) {
  if (Array.isArray(args)) {
    return [args, options]
  }

  if (typeof args === 'object') {
    return [[], args]
  }

  return []
}

// Allow running local binaries by default
const DEFAULT_OPTIONS = { preferLocal: true }

// Redirect output by default, unless specified otherwise
const redirectOutput = function (childProcess, { stdio, stdout, stderr }) {
  if (stdio !== undefined || stdout !== undefined || stderr !== undefined) {
    return
  }

  childProcess.stdout.pipe(process.stdout)
  childProcess.stderr.pipe(process.stderr)
}
