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
  [/Require stack:\n[^}]*}/g, 'STACK TRACE'],
  [/{ Error:/g, 'Error:'],
  [/^.*:\d+:\d+\)?$/gm, 'STACK TRACE'],
  [/^\s+at .*$/gm, 'STACK TRACE'],
  [/(STACK TRACE\n)+/g, 'STACK TRACE\n'],
  // Durations
  [/[\d.]+m?s/g, '1ms'],
  // Package versions
  [/([@v])[\d.]+/g, '$11.0.0'],
  // Multiline objects are printed differently by `util.inspect()` in Node 8 and
  // 12 due to different default options
  [/{\n\s+/gm, '{ '],
  [/\n}/gm, ' }'],
  [/,\n\s+/gm, ', '],
  [/:\n\s+/gm, ': '],
  // Semantic versions
  [/v\d+\.\d+\.\d+/, 'v1.0.0'],
  // npm install logs
  [/added \d+ package.*/, 'added packages'],
  [/^npm ERR!.*/gm, 'npm ERR!'],
  [/(npm ERR!\n)+/g, 'npm ERR!\n'],
]

module.exports = { normalizeOutput }
