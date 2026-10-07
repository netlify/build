import chalk from 'chalk'
import figures from 'figures'
import { stringify } from 'yaml'

import type { BufferedLogs, Logs } from './types.js'

export const THEME = {
  subHeader: chalk.cyan.bold,
  errorSubHeader: chalk.red.bold,
  warningLine: chalk.yellowBright,
  highlightWords: chalk.cyan,
}

const logsAreBuffered = (logs: Logs | undefined): logs is BufferedLogs => logs !== undefined && 'stdout' in logs

// The buildbot drops empty lines, so they get a zero-width space. The multiline `\s*` also merges
// runs of blank lines, which has always been so.
const EMPTY_LINES = /^\s*$/gm
const EMPTY_LINE = '\u{200B}'

// Always to stderr, since stdout is reserved for the binary's JSON output.
export const log = function (logs: Logs | undefined, message: string, color?: (text: string) => string) {
  const withEmptyLines = message.replace(EMPTY_LINES, EMPTY_LINE)
  const text = color === undefined ? withEmptyLines : color(withEmptyLines)

  logs?.outputFlusher?.flush()

  if (logsAreBuffered(logs)) {
    logs.stderr.push(text)
    return
  }

  console.warn(text)
}

export const logWarning = function (logs: Logs | undefined, message: string) {
  log(logs, message, THEME.warningLine)
}

export const logSubHeader = function (logs: Logs | undefined, title: string) {
  log(logs, `\n${figures.pointer} ${title}`, THEME.subHeader)
}

export const logObject = function (logs: Logs | undefined, object: object) {
  log(logs, stringify(object, { sortMapEntries: true }).trimEnd())
}
