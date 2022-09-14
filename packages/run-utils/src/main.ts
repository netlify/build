import process from 'process'

import { execa, ExecaChildProcess, execaCommand, Options } from 'execa'

// Run a command, with arguments being an array
export const run = function (file: string, args: string[] = [], options: Options = new Object()) {
  const cmdOptions = { ...DEFAULT_OPTIONS, ...options }
  const childProcess = execa(file, args, cmdOptions)

  useParentStdOut(childProcess, cmdOptions)
  return childProcess
}

// Run a command, with file + arguments being a single string
export const runCommand = function (command: string, options: Options) {
  const cmdOptions = { ...DEFAULT_OPTIONS, ...options }
  const childProcess = execaCommand(command, cmdOptions)

  useParentStdOut(childProcess, cmdOptions)
  return childProcess
}

// Allow running local binaries by default
const DEFAULT_OPTIONS = { preferLocal: true }

// Redirect output by default, unless specified otherwise
const useParentStdOut = function (childProcess: ExecaChildProcess, { stdio, stdout, stderr }: Options) {
  if (stdio !== undefined || stdout !== undefined || stderr !== undefined) {
    return
  }

  childProcess.stdout.pipe(process.stdout)
  childProcess.stderr.pipe(process.stderr)
}
