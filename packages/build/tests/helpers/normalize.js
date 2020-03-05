const stripAnsi = require('strip-ansi')
const { tick, pointer, arrowDown } = require('figures')

// Normalize log output so it can be snapshot consistently across test runs
const normalizeOutput = function(output) {
  const outputA = stripAnsi(output)
  return NORMALIZE_REGEXPS.reduce(replaceOutput, outputA)
}

const replaceOutput = function(output, [regExp, replacement]) {
  return output.replace(regExp, replacement)
}

const NORMALIZE_REGEXPS = [
  // Zero width space characters due to a bug in buildbot:
  // https://github.com/netlify/buildbot/issues/595
  [/\u{200b}/gu, ''],
  // Windows specifics
  [/\r\n/gu, '\n'],
  [/\\/gu, '/'],
  [/[A-Z]:\//g, '/'],
  [/Program Files/gu, 'ProgramFiles'],
  [new RegExp(tick, 'g'), '√'],
  [new RegExp(pointer, 'g'), '>'],
  [new RegExp(arrowDown, 'g'), '↓'],
  [/^.*(Have a nice day)/m, '$1'],
  [/⚠/gu, '‼'],
  // A bug in nyc (https://github.com/istanbuljs/istanbuljs/issues/141) is
  // creating those error messages on Windows. This happens randomly and
  // seldomly. This might be fixed by nyc@15
  [/Transformation error for .*\n/g, ''],
  [/EPERM: operation not permitted, rename .*\n/g, ''],
  // File paths
  [/packages\/+build/g, '/packages/build'],
  [/Caching [.~]\//g, 'Caching '],
  [/(^|[ "'])\.{0,2}\/[^ "'\n]+/gm, '$1/file/path'],
  // When serializing flags, Windows keep single quotes due to backslashes,
  // but not Unix
  [/: '\/file\/path'$/gm, ': /file/path'],
  // CI tests show some error messages differently
  [/\/file\/path bad option/g, 'node: bad option'],
  // Stack traces
  [/Require stack:\n(\s*- \/file\/path\n)+/g, ''],
  [/Require stack:\n[^}]*}/g, ''],
  [/{ Error:/g, 'Error:'],
  [/^.*:\d+:\d+\)?$/gm, 'STACK TRACE'],
  [/^\s+at .*$/gm, 'STACK TRACE'],
  [/(STACK TRACE\n)+/g, 'STACK TRACE\n'],
  // Durations
  [/\d[\d.]*m?s/g, '1ms'],
  // Package versions
  [/([@v])[\d.]+/g, '$11.0.0'],
  // Multiline objects are printed differently by `util.inspect()` in Node 8 and
  // 12 due to different default options
  [/{\n\s+/gm, '{ '],
  [/\n}/gm, ' }'],
  [/,\n\s+/gm, ', '],
  [/:\n\s+([^-\s])/gm, ': $1'],
  // Semantic versions
  [/\d+\.\d+\.\d+/, '1.0.0'],
  // npm install logs
  [/added \d+ package.*/, 'added packages'],
  [/^npm ERR!.*/gm, 'npm ERR!'],
  [/(npm ERR!\n)+/g, 'npm ERR!\n'],
  // Empty lines
  [/^ +$/gm, ''],
]

module.exports = { normalizeOutput }
