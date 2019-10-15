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
  // Stack traces
  [/^.*\([^)]+:\d+:\d+\)$/gm, 'STACK TRACE'],
  [/^\s+at .*$/gm, 'STACK TRACE'],
  [/(STACK TRACE\n)+/, 'STACK TRACE'],
  // Durations
  [/[\d.]+m?s/g, '1ms'],
  // Package versions
  [/@[\d.]+/g, '@VERSION'],
  // Multiline objects are printed differently by `util.inspect()` in Node 8 and
  // 12 due to different default options
  [/{\n\s+/gm, '{ '],
  [/\n}/gm, ' }'],
  [/,\n\s+/gm, ', '],
  [/:\n\s+/gm, ': ']
]

module.exports = { normalizeOutput }
