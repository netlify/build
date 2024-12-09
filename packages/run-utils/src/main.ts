import process from 'process'

import { execa, type Subprocess, execaCommand, type Options } from 'execa'

/** Allow running local binaries by default */
const DEFAULT_OPTIONS: Partial<Options> = { preferLocal: true, verbose: 'full' }

/** Run a command, with arguments being an array */
export const run = (file: string, args?: string[] | object, options?: Options) => {
  const [argsA, optionsA] = parseArgs(args, options)
  const optionsB = { ...DEFAULT_OPTIONS, ...optionsA }
  const childProcess = execa(file, argsA, optionsB)
  redirectOutput(childProcess, optionsB)
  return childProcess
}

/** Run a command, with file + arguments being a single string */
export const runCommand = (command: string, options: Options): Subprocess => {
  const optionsA = { ...DEFAULT_OPTIONS, ...options }
  const childProcess = execaCommand(command, optionsA)
  redirectOutput(childProcess, optionsA)
  return childProcess
}

/** Both `args` and `options` are optional */
const parseArgs = function (args, options?: Options) {
  if (Array.isArray(args)) {
    return [args, options]
  }

  if (typeof args === 'object') {
    return [[], args]
  }

  return []
}

/**
 * Redirect output by default, unless specified otherwise
 * */
const redirectOutput = (childProcess: Subprocess, options: Options) => {
  if (options.stdio !== undefined || options.stdout !== undefined || options.stderr !== undefined) {
    return
  }

  childProcess.stdout?.pipe(process.stdout)
  childProcess.stderr?.pipe(process.stderr)
}
