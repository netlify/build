import { createWriteStream } from 'fs'

import figures from 'figures'
import indentString from 'indent-string'

import { getHeader } from './header.js'
import { serializeArray, serializeObject } from './serialize.js'
import { THEME } from './theme.js'

export type BufferedLogs = { stdout: string[]; stderr: string[] }

const INDENT_SIZE = 2

/**
 * We need to add a zero width space character in empty lines. Otherwise the
 * buildbot removes those due to a bug: https://github.com/netlify/buildbot/issues/595
 */
const EMPTY_LINES_REGEXP = /^\s*$/gm
const EMPTY_LINE = '\u{200B}'

/**
 * When the `buffer` option is true, we return logs instead of printing them
 * on the console. The logs are accumulated in a `logs` array variable.
 */
export const getBufferLogs = (config: { buffer?: boolean }): BufferedLogs | undefined => {
  const { buffer = false } = config
  if (!buffer) {
    return
  }

  return { stdout: [], stderr: [] }
}

// Core logging utility, used by the other methods.
// This should be used instead of `console.log()` as it allows us to instrument
// how any build logs is being printed.
export const log = function (
  logs: BufferedLogs | undefined,
  string: string,
  config: { indent?: boolean; color?: (string: string) => string } = {},
) {
  const { indent = false, color } = config
  const stringA = indent ? indentString(string, INDENT_SIZE) : string
  const stringB = String(stringA).replace(EMPTY_LINES_REGEXP, EMPTY_LINE)
  const stringC = color === undefined ? stringB : color(stringB)

  if (logs !== undefined) {
    // `logs` is a stateful variable

    logs.stdout.push(stringC)
    return
  }

  console.log(stringC)
}

const serializeIndentedArray = function (array) {
  return serializeArray(array.map(serializeIndentedItem))
}

const serializeIndentedItem = function (item) {
  return indentString(item, INDENT_SIZE + 1).trimStart()
}

export const logError = function (logs: BufferedLogs | undefined, string: string, opts = {}) {
  log(logs, string, { color: THEME.errorLine, ...opts })
}

export const logWarning = function (logs: BufferedLogs | undefined, string: string, opts = {}) {
  log(logs, string, { color: THEME.warningLine, ...opts })
}

// Print a message that is under a header/subheader, i.e. indented
export const logMessage = function (logs: BufferedLogs | undefined, string: string, opts = {}) {
  log(logs, string, { indent: true, ...opts })
}

// Print an object
export const logObject = function (logs: BufferedLogs | undefined, object, opts) {
  logMessage(logs, serializeObject(object), opts)
}

// Print an array
export const logArray = function (logs: BufferedLogs | undefined, array, opts = {}) {
  logMessage(logs, serializeIndentedArray(array), { color: THEME.none, ...opts })
}

// Print an array of errors
export const logErrorArray = function (logs: BufferedLogs | undefined, array, opts = {}) {
  logMessage(logs, serializeIndentedArray(array), { color: THEME.errorLine, ...opts })
}

// Print an array of warnings
export const logWarningArray = function (logs: BufferedLogs | undefined, array, opts = {}) {
  logMessage(logs, serializeIndentedArray(array), { color: THEME.warningLine, ...opts })
}

// Print a main section header
export const logHeader = function (logs: BufferedLogs | undefined, string: string, opts = {}) {
  log(logs, `\n${getHeader(string)}`, { color: THEME.header, ...opts })
}

// Print a main section header, when an error happened
export const logErrorHeader = function (logs: BufferedLogs | undefined, string: string, opts = {}) {
  logHeader(logs, string, { color: THEME.errorHeader, ...opts })
}

// Print a sub-section header
export const logSubHeader = function (logs: BufferedLogs | undefined, string: string, opts = {}) {
  log(logs, `\n${figures.pointer} ${string}`, { color: THEME.subHeader, ...opts })
}

// Print a sub-section header, when an error happened
export const logErrorSubHeader = function (logs: BufferedLogs | undefined, string: string, opts = {}) {
  logSubHeader(logs, string, { color: THEME.errorSubHeader, ...opts })
}

// Print a sub-section header, when a warning happened
export const logWarningSubHeader = function (logs: BufferedLogs | undefined, string: string, opts = {}) {
  logSubHeader(logs, string, { color: THEME.warningSubHeader, ...opts })
}

// Combines an array of elements into a single string, separated by a space,
// and with basic serialization of non-string types
export const reduceLogLines = function (lines) {
  return lines
    .map((input) => {
      if (input instanceof Error) {
        return `${input.message} ${input.stack}`
      }

      if (typeof input === 'object') {
        try {
          return JSON.stringify(input)
        } catch {
          // Value could not be serialized to JSON, so we return the string
          // representation.
          return String(input)
        }
      }

      return String(input)
    })
    .join(' ')
}

/**
 * Builds a function for logging data to the system logger (i.e. hidden from
 * the user-facing build logs)
 */
export const getSystemLogger = function (
  logs: BufferedLogs | undefined,
  debug: boolean,
  /** A system log file descriptor, if non is provided it will be a noop logger */
  systemLogFile?: number,
): (...args: any[]) => void {
  // If the `debug` flag is used, we return a function that pipes system logs
  // to the regular logger, as the intention is for them to end up in stdout.
  if (debug) {
    return (...args) => log(logs, reduceLogLines(args))
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
    logError(logs, 'Could not write to system log file')
  })

  return (...args) => fileDescriptor.write(`${reduceLogLines(args)}\n`)
}
