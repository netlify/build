import { createWriteStream } from 'node:fs'
import { readFile, realpath } from 'node:fs/promises'

import { diag, type DiagLogger } from '@opentelemetry/api'
import { parseKeyPairsIntoRecord } from '@opentelemetry/core/build/src/baggage/utils.js'
import { type PackageJson, readPackageUp } from 'read-package-up'

/**
 * Builds a function for logging data to a provided fileDescriptor (i.e. hidden from
 * the user-facing build logs)
 * This has been pulled from @netlify/build as a quick way to hook into the system logger
 */
const getSystemLogger = function (
  debug: boolean,
  /** A system log file descriptor, if non is provided it will be a noop logger */
  systemLogFile?: number,
): (...args: any[]) => void {
  // If the `debug` flag is used, we return a function that pipes system logs
  // to the regular logger, as the intention is for them to end up in stdout.
  // For now we just use plain `console.log`, later on we can revise it
  if (debug) {
    return (...args) => console.log(...args)
  }

  // If there's not a file descriptor configured for system logs and `debug`
  // is not set, we return a no-op function that will swallow the errors.
  if (!systemLogFile) {
    return () => {
      // no-op
    }
  }

  // Return a function that writes to the file descriptor configured for system
  // logs.
  const fileDescriptor = createWriteStream('', { fd: systemLogFile })

  fileDescriptor.on('error', () => {
    console.error('Could not write to system log file')
  })

  return (...args) => fileDescriptor.write(`${console.log(...args)}\n`)
}

/** Given a simple logging function return a `DiagLogger`. Used to setup our system logger as the diag logger.*/
export const getDiagLogger = function (
  debug: boolean,
  /** A system log file descriptor, if non is provided it will be a noop logger */
  systemLogFile?: number,
): DiagLogger {
  const logger = getSystemLogger(debug, systemLogFile)
  const otelLogger = (...args: any[]) => {
    // Debug log msgs can be an array of 1 or 2 elements with the second element being an array fo multiple elements
    const msgs = args.flat(1)
    logger('[otel-traces]', ...msgs)
  }
  return {
    debug: otelLogger,
    info: otelLogger,
    error: otelLogger,
    verbose: otelLogger,
    warn: otelLogger,
  }
}

/** Loads the baggage attributes from a baggage file which follows W3C Baggage specification */
export const loadBaggageFromFile = async function (baggageFilePath?: string) {
  if (baggageFilePath === undefined || baggageFilePath.length === 0) {
    diag.warn('No baggage file path provided, no context loaded')
    return {}
  }
  let baggageString: string
  try {
    baggageString = await readFile(baggageFilePath, 'utf-8')
  } catch (error) {
    diag.error(error)
    return {}
  }
  return parseKeyPairsIntoRecord(baggageString)
}

/**
 * Given a path to a node executable (potentially a symlink) get the module packageJson
 */
export const findExecutablePackageJSON = async function (path: string): Promise<PackageJson> {
  let pathToSearch: string
  try {
    // resolve symlinks
    pathToSearch = await realpath(path)
  } catch {
    // bail early if we can't resolve the path
    return {}
  }

  try {
    const result = await readPackageUp({ cwd: pathToSearch, normalize: false })
    if (result === undefined) return {}
    const { packageJson } = result
    return packageJson
  } catch {
    // packageJson read failed, we ignore the error and return an empty obj
    return {}
  }
}
