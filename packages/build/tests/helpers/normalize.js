const { tick, pointer, arrowDown } = require('figures')
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
  [/⚠/gu, '‼'],
  // A bug in nyc (https://github.com/istanbuljs/istanbuljs/issues/141) is
  // creating those error messages on Windows. This happens randomly and
  // seldomly. This might be fixed by nyc@15
  [/Transformation error for .*\n/g, ''],
  [/EPERM: operation not permitted, rename .*\n/g, ''],
  // File paths
  [/packages\/+build/g, '/packages/build'],
  [/Caching [.~]\//g, 'Caching '],
  [/(^|[ "'(=])\.{0,2}\/[^ "')\n]+/gm, '$1/file/path'],
  // When serializing flags, Windows keep single quotes due to backslashes,
  // but not Unix
  [/: '\/file\/path'$/gm, ': /file/path'],
  // CI tests show some error messages differently
  [/\/file\/path bad option/g, 'node: bad option'],
  // Stack traces
  [/Cannot find module .*/, ''],
  [/Require stack:\n(\s*- \/file\/path\n)+/g, ''],
  [/Require stack:\n[^}]*}/g, ''],
  [/{ Error:/g, 'Error:'],
  [/^.*:\d+:\d+\)?$/gm, 'STACK TRACE'],
  [/^\s+at .*$/gm, 'STACK TRACE'],
  [/(STACK TRACE\n)+/g, 'STACK TRACE\n'],
  // Durations
  [/(\d[\d.]*(ms|m|s)( )?)+/g, '1ms'],
  // Package versions
  [/([@v])[\d.]+/g, '$11.0.0'],
  // Semantic versions
  [/\d+\.\d+\.\d+(-\d+)?/g, '1.0.0'],
  // npm install logs
  [/added \d+ package.*/g, 'added packages'],
  // npm install logs look different on Node 8.3.0
  [/\snpm ERR! 404([^]*npm ERR! 404)?.*/g, ''],
  // Empty lines
  [/^ +$/gm, ''],
  // HTTP errors are shown differently in Node 8
  [/ \.\.\.:443/g, ''],
]

module.exports = { normalizeOutput }
