import figures from 'figures'

import { serializeObject } from './serialize.js'
import { THEME } from './theme.js'

// When the `buffer` option is true, we return logs instead of printing them
// on the console. The logs are accumulated in a `logs` array variable.
export const getBufferLogs = function ({ buffer }) {
  if (!buffer) {
    return
  }

  return { stdout: [], stderr: [] }
}

// This should be used instead of `console.log()`
// Printed on stderr because stdout is reserved for the JSON output
export const log = function (logs, string, { color } = {}) {
  const stringA = String(string).replace(EMPTY_LINES_REGEXP, EMPTY_LINE)
  const stringB = color === undefined ? stringA : color(stringA)

  if (logs !== undefined) {
    // `logs` is a stateful variable
    // eslint-disable-next-line fp/no-mutating-methods
    logs.stderr.push(stringB)
    return
  }

  console.warn(stringB)
}

// We need to add a zero width space character in empty lines. Otherwise the
// buildbot removes those due to a bug: https://github.com/netlify/buildbot/issues/595
const EMPTY_LINES_REGEXP = /^\s*$/gm
const EMPTY_LINE = '\u{200B}'

export const logWarning = function (logs, string, opts) {
  log(logs, string, { color: THEME.warningLine, ...opts })
}

export const logObject = function (logs, object, opts) {
  log(logs, serializeObject(object), opts)
}

export const logSubHeader = function (logs, string, opts) {
  log(logs, `\n${figures.pointer} ${string}`, { color: THEME.subHeader, ...opts })
}
