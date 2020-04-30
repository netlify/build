// We group errors by `error.message`. However some `error.message` contain
// unique IDs, etc. which defeats that grouping. So we normalize those to make
// them consistent
const normalizeGroupingMessage = function(message) {
  return NORMALIZE_REGEXPS.reduce(normalizeMessage, message)
}

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
]

module.exports = { normalizeGroupingMessage }
