const {
  cyanBright: { bold: cyanBrightBold },
  cyan: { bold: cyanBold },
  redBright: { bold: redBrightBold },
} = require('chalk')
const { pointer } = require('figures')
const indentString = require('indent-string')

const { getHeader } = require('./header')
const { serializeObject, serializeArray } = require('./serialize')

// This should be used instead of `console.log()`
const log = function(string) {
  const stringA = string.replace(EMPTY_LINES_REGEXP, EMPTY_LINE)
  console.log(stringA)
}

// We need to add a zero width space character in empty lines. Otherwise the
// buildbot removes those due to a bug: https://github.com/netlify/buildbot/issues/595
const EMPTY_LINES_REGEXP = /^\s*$/gm
const EMPTY_LINE = '\u{200b}'

const logMessage = function(string) {
  const stringA = indentString(string, INDENT_SIZE)
  log(stringA)
}

const INDENT_SIZE = 2

const logObject = function(object) {
  const string = serializeObject(object)
  logMessage(string)
}

const logArray = function(array) {
  const string = serializeArray(array)
  logMessage(string)
}

const logHeader = function(string, { color = cyanBrightBold } = {}) {
  const stringA = `\n${color(getHeader(string))}`
  log(stringA)
}

const logErrorHeader = function(string) {
  return logHeader(string, { color: redBrightBold })
}

const logSubHeader = function(string) {
  const stringA = `\n${cyanBold(`${pointer} ${string}`)}`
  log(stringA)
}

module.exports = { log, logMessage, logObject, logArray, logHeader, logErrorHeader, logSubHeader }
