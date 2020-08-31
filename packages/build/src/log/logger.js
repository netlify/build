const { pointer } = require('figures')
const indentString = require('indent-string')

const { getHeader } = require('./header')
const { serializeObject, serializeArray } = require('./serialize')
const { THEME } = require('./theme')

// When the `buffer` option is true, we return logs instead of printing them
// on the console. The logs are accumulated in a `logs` array variable.
const getBufferLogs = function({ buffer = false }) {
  if (!buffer) {
    return
  }

  return { stdout: [], stderr: [] }
}

// This should be used instead of `console.log()`
const log = function(logs, string) {
  const stringA = String(string).replace(EMPTY_LINES_REGEXP, EMPTY_LINE)

  if (logs !== undefined) {
    // `logs` is a stateful variable
    // eslint-disable-next-line fp/no-mutating-methods
    logs.stdout.push(stringA)
    return
  }

  console.log(stringA)
}

// We need to add a zero width space character in empty lines. Otherwise the
// buildbot removes those due to a bug: https://github.com/netlify/buildbot/issues/595
const EMPTY_LINES_REGEXP = /^\s*$/gm
const EMPTY_LINE = '\u{200b}'

const logMessage = function(logs, string, { indent = true } = {}) {
  const stringA = indent ? indentString(string, INDENT_SIZE) : string
  log(logs, stringA)
}

const INDENT_SIZE = 2

const logObject = function(logs, object) {
  const string = serializeObject(object)
  logMessage(logs, string)
}

const logArray = function(logs, array, { color = THEME.none, indent } = {}) {
  const string = color(serializeArray(array))
  logMessage(logs, string, { indent })
}

const logHeader = function(logs, string, { color = THEME.header } = {}) {
  const stringA = `\n${color(getHeader(string))}`
  log(logs, stringA)
}

const logErrorHeader = function(logs, string) {
  return logHeader(logs, string, { color: THEME.errorHeader })
}

const logSubHeader = function(logs, string) {
  const stringA = `\n${THEME.subHeader(`${pointer} ${string}`)}`
  log(logs, stringA)
}

const logErrorSubHeader = function(logs, string) {
  const stringA = `\n${THEME.errorSubHeader(`${pointer} ${string}`)}`
  log(logs, stringA)
}

module.exports = {
  getBufferLogs,
  log,
  logMessage,
  logObject,
  logArray,
  logHeader,
  logErrorHeader,
  logSubHeader,
  logErrorSubHeader,
}
