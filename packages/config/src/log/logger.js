// This should be used instead of `console.log()`
// Printed on stderr because stdout is reserved for the JSON output
const log = function(string) {
  const stringA = String(string).replace(EMPTY_LINES_REGEXP, EMPTY_LINE)
  console.warn(stringA)
}

// We need to add a zero width space character in empty lines. Otherwise the
// buildbot removes those due to a bug: https://github.com/netlify/buildbot/issues/595
const EMPTY_LINES_REGEXP = /^\s*$/gm
const EMPTY_LINE = '\u{200b}'

const logObject = function(object) {
  const string = serializeObject(object)
  log(string)
}

const serializeObject = function(object) {
  return JSON.stringify(object, null, 2)
}

module.exports = { log, logObject }
