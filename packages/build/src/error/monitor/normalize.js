'use strict'

// We group errors by `error.message`. However some `error.message` contain
// unique IDs, etc. which defeats that grouping. So we normalize those to make
// them consistent
const normalizeGroupingMessage = function (message, type) {
  const messageA = removeDependenciesLogs(message, type)
  return NORMALIZE_REGEXPS.reduce(normalizeMessage, messageA)
}

// Discard debug/info installation information
const removeDependenciesLogs = function (message, type) {
  if (type !== 'dependencies') {
    return message
  }

  return message.split('\n').filter(isErrorLine).join('\n')
}

const isErrorLine = function (line) {
  return ERROR_LINES.some((errorLine) => line.startsWith(errorLine))
}

const ERROR_LINES = [
  // Prefix for npm
  'npm ERR!',
  // Prefix for Yarn
  'error',
]

const normalizeMessage = function (message, [regExp, replacement]) {
  return message.replace(regExp, replacement)
}

const NORMALIZE_REGEXPS = [
  // Base64 URL
  [/(data:[^;]+;base64),[\w+/-]+/g, 'dataURI'],
  // File paths
  [/(["'`, ]|^)([^"'`, \n]*[/\\][^"'`, \n]*)(["'`, ]|$)/gm, '$1/file/path$3'],
  // Semantic versions
  [/\d+\.\d+\.\d+(-\d+)?/g, '1.0.0'],
  [/version "[^"]+"/g, 'version "1.0.0"'],
  // Cypress plugin prints the user's platform
  [/^Platform: .*/gm, ''],
  // URLs
  [/https?:[\w.+~!$&'()*,;=:@/?#]+/g, 'https://domain.com'],
  // Numbers, e.g. number of issues/problems
  [/\d+/g, '0'],
  // Hexadecimal strings
  [/[\da-fA-F]{6,}/g, 'hex'],
  // On unknown inputs, we print the inputs
  [/(does not accept any inputs but you specified: ).*/, '$1'],
  [/(Unknown inputs for plugin).*/, '$1'],
  [/(Plugin inputs should be one of: ).*/, '$1'],
  // On required inputs, we print the inputs
  [/^Plugin inputs[^]*/gm, ''],
  [/(Required inputs for plugin).*/gm, '$1'],
  // Netlify Functions validation check
  [/(should target a directory, not a regular file):.*/, '$1'],
  // zip-it-and-ship-it error when there is a `require()` but dependencies
  // were not installed
  [/(Cannot find module) '([^']+)'/g, "$1 'moduleName'"],
  [/(A Netlify Function is using) "[^"]+"/g, '$1 "moduleName"'],
  // netlify-plugin-inline-critical-css errors prints a list of file paths
  [/Searched in: .*/g, ''],
  // netlify-plugin-subfont prints font name in errors
  [/(is not supported yet): .*/, '$1'],
  // netlify-plugin-subfont prints generic information in every error that
  // is highly build-specific
  [/^(vers?ions|Plugin configuration|Subfont called with): {[^}]+}/gm, ''],
  [/^Resolved entry points: \[[^\]]+]/gm, ''],
  // netlify-plugin-minify-html parse error
  [/(Parse Error):[^]*/, '$1'],
  // Multiple empty lines
  [/^\s*$/gm, ''],
]

module.exports = { normalizeGroupingMessage }
