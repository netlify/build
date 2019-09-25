const stripAnsi = require('strip-ansi')

// Normalize log output so it can be snapshot consistently across test runs
const normalizeOutput = function(output) {
  const outputA = stripAnsi(output)
  return NORMALIZE_REGEXPS.reduce(replaceOutput, outputA)
}

const replaceOutput = function(output, [regExp, replacement]) {
  return output.replace(regExp, replacement)
}

const NORMALIZE_REGEXPS = [
  // Windows specifics
  [/\r\n/gu, '\n'],
  [/\\/gu, '/'],
  // File paths
  [/(^|[ "'])\.{0,2}\/[^ "'\n]+/gm, '$1/file/path'],
  // Durations
  [/[\d.]+ms/g, '1ms'],
  // Package versions
  [/@[\d.]+/g, '@VERSION']
]

module.exports = { normalizeOutput }
