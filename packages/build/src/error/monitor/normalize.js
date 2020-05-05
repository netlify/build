// We group errors by `error.message`. However some `error.message` contain
// unique IDs, etc. which defeats that grouping. So we normalize those to make
// them consistent
const normalizeGroupingMessage = function(message, type) {
  const messageA = removeDependenciesLogs(message, type)
  return NORMALIZE_REGEXPS.reduce(normalizeMessage, messageA)
}

// Discard debug/info installation information
const removeDependenciesLogs = function(message, type) {
  if (type !== 'dependencies') {
    return message
  }

  return message
    .split('\n')
    .filter(isErrorLine)
    .join('\n')
}

const isErrorLine = function(line) {
  return ERROR_LINES.some(errorLine => line.startsWith(errorLine))
}

const ERROR_LINES = [
  // Prefix for npm
  'npm ERR!',
  // Prefix for Yarn
  'error',
]

const normalizeMessage = function(message, [regExp, replacement]) {
  return message.replace(regExp, replacement)
}

const NORMALIZE_REGEXPS = [
  // File paths
  [/(["'` ]|^)([^"'` ]*[/\\][^"'` ]*)(["'` ]|$)/gm, '$1/file/path$3'],
  // Semantic versions
  [/\d+\.\d+\.\d+(-\d+)?/g, '1.0.0'],
  [/version "[^"]+"/g, 'version "1.0.0"'],
  // Cypress plugin prints the user's platform
  [/^Platform: .*/gm, ''],
  // URLs
  [/https?:[\w.+_~!$&'()*,;=:@/?#]+/g, 'https://domain.com'],
  // Numbers, e.g. number of issues/problems
  [/\d+/g, '0'],
]

module.exports = { normalizeGroupingMessage }
