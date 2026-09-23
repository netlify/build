import figures from 'figures'

import type { BufferedLogs, Logs } from '../types/logs.js'

import { serializeObject } from './serialize.js'
import { THEME } from './theme.js'

export const logsAreBuffered = (logs: Logs | undefined): logs is BufferedLogs => logs !== undefined && 'stdout' in logs

/** With the `buffer` option, logs are collected in memory and returned instead of printed. */
export const getBufferLogs = function ({ buffer }: { buffer?: boolean }): BufferedLogs | undefined {
  if (!buffer) {
    return
  }

  return { stdout: [], stderr: [] }
}

type LogOptions = { color?: (message: string) => string }

// The buildbot drops empty lines (https://github.com/netlify/buildbot/issues/595), so they get
// a zero-width space.
const EMPTY_LINES_REGEXP = /^\s*$/gm
const EMPTY_LINE = '\u{200B}'

/** Print a message, to stderr since stdout is reserved for the binary's JSON output. */
export const log = function (logs: Logs | undefined, message: string, { color }: LogOptions = {}) {
  const withEmptyLines = message.replace(EMPTY_LINES_REGEXP, EMPTY_LINE)
  const colored = color === undefined ? withEmptyLines : color(withEmptyLines)

  logs?.outputFlusher?.flush()

  if (logsAreBuffered(logs)) {
    logs.stderr.push(colored)
    return
  }

  console.warn(colored)
}

export const logWarning = function (logs: Logs | undefined, message: string, options?: LogOptions) {
  log(logs, message, { color: THEME.warningLine, ...options })
}

export const logObject = function (logs: Logs | undefined, object: object, options?: LogOptions) {
  log(logs, serializeObject(object), options)
}

export const logSubHeader = function (logs: Logs | undefined, message: string, options?: LogOptions) {
  log(logs, `\n${figures.pointer} ${message}`, { color: THEME.subHeader, ...options })
}
