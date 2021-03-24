'use strict'

const { pointer } = require('figures')
const indentString = require('indent-string')

const { getHeader } = require('./header')
const { serializeObject, serializeArray } = require('./serialize')
const { THEME } = require('./theme')

// When the `buffer` option is true, we return logs instead of printing them
// on the console. The logs are accumulated in a `logs` array variable.
const getBufferLogs = function ({ buffer = false }) {
  if (!buffer) {
    return
  }

  return { stdout: [], stderr: [] }
}

// Core logging utility, used by the other methods.
// This should be used instead of `console.log()` as it allows us to instrument
// how any build logs is being printed.
const log = function (logs, string, { indent = false, color } = {}) {
  const stringA = indent ? indentString(string, INDENT_SIZE) : string
  const stringB = String(stringA).replace(EMPTY_LINES_REGEXP, EMPTY_LINE)
  const stringC = color === undefined ? stringB : color(stringB)

  if (logs !== undefined) {
    // `logs` is a stateful variable
    // eslint-disable-next-line fp/no-mutating-methods
    logs.stdout.push(stringC)
    return
  }

  console.log(stringC)
}

const INDENT_SIZE = 2

// We need to add a zero width space character in empty lines. Otherwise the
// buildbot removes those due to a bug: https://github.com/netlify/buildbot/issues/595
const EMPTY_LINES_REGEXP = /^\s*$/gm
const EMPTY_LINE = '\u{200B}'

const serializeIndentedArray = function (array) {
  return serializeArray(array.map(serializeIndentedItem))
}

const serializeIndentedItem = function (item) {
  return indentString(item, INDENT_SIZE + 1).trimLeft()
}

const logWarning = function (logs, string, opts) {
  log(logs, string, { color: THEME.warningLine, ...opts })
}

// Print a message that is under a header/subheader, i.e. indented
const logMessage = function (logs, string, opts) {
  log(logs, string, { indent: true, ...opts })
}

// Print an object
const logObject = function (logs, object, opts) {
  logMessage(logs, serializeObject(object), opts)
}

// Print an array
const logArray = function (logs, array, opts) {
  logMessage(logs, serializeIndentedArray(array), { color: THEME.none, ...opts })
}

// Print an array of warnings
const logWarningArray = function (logs, array, opts) {
  logMessage(logs, serializeIndentedArray(array), { color: THEME.warningLine, ...opts })
}

// Print a main section header
const logHeader = function (logs, string, opts) {
  log(logs, `\n${getHeader(string)}`, { color: THEME.header, ...opts })
}

// Print a main section header, when an error happened
const logErrorHeader = function (logs, string, opts) {
  logHeader(logs, string, { color: THEME.errorHeader, ...opts })
}

// Print a sub-section header
const logSubHeader = function (logs, string, opts) {
  log(logs, `\n${pointer} ${string}`, { color: THEME.subHeader, ...opts })
}

// Print a sub-section header, when an error happened
const logErrorSubHeader = function (logs, string, opts) {
  logSubHeader(logs, string, { color: THEME.errorSubHeader, ...opts })
}

// Print a sub-section header, when a warning happened
const logWarningSubHeader = function (logs, string, opts) {
  logSubHeader(logs, string, { color: THEME.warningSubHeader, ...opts })
}

module.exports = {
  getBufferLogs,
  log,
  logWarning,
  logMessage,
  logObject,
  logArray,
  logWarningArray,
  logHeader,
  logErrorHeader,
  logSubHeader,
  logErrorSubHeader,
  logWarningSubHeader,
  pointer,
}
