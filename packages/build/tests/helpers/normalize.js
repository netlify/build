'use strict'

const { relative, resolve } = require('path')

const { tick, pointer, arrowDown } = require('figures')
const stripAnsi = require('strip-ansi')

// Normalize log output so it can be snapshot consistently across test runs
const normalizeOutput = function (output) {
  const outputA = stripAnsi(output)
  return NORMALIZE_REGEXPS.reduce(replaceOutput, outputA)
}

const replaceOutput = function (output, [regExp, replacement]) {
  return output.replace(regExp, replacement)
}

const rootPath = resolve(__dirname, '../../../..')
const unixify = (path) => path.replace(/\\/gu, '/')

const NORMALIZE_REGEXPS = [
  // Zero width space characters due to a bug in buildbot:
  // https://github.com/netlify/buildbot/issues/595
  [/\u{200B}/gu, ''],
  // Windows specifics
  [/\r\n/gu, '\n'],
  [/\\{1,2}/gu, '/'],
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
  [/Caching [.~]\//g, 'Caching '],
  [/(packages\/.*\/fixtures\/.*\.(?:js|ts))(:(\d)+:(\d)+:)/g, '$1'],
  // Normalizes any paths so that they're relative to process.cwd().
  [
    /(^|[ "'(=])((?:\.{0,2}|([A-Z]:))(\/[^ "')\n]+))/gm,
    // eslint-disable-next-line complexity, max-params
    (_, prefix, pathMatch, winDrive, pathTrail) => {
      // If we're dealing with a Windows path, we discard the drive letter.
      const fullPath = winDrive ? pathTrail : pathMatch
      const tmpDirMatch = fullPath.match(/netlify-build-tmp-dir\d+(.*)/)

      // If this is a temporary directory with a randomly-generated name, we
      // replace it with the string "tmp-dir" so that the result is consistent.
      if (tmpDirMatch) {
        return unixify(`${prefix}/tmp-dir${tmpDirMatch[1]}`)
      }

      // If this is a socket created for the test suite, we transform it to
      // "/test/socket".
      if (/netlify-test-socket-(.{6})$/.test(fullPath)) {
        return unixify(`${prefix}/test/socket`)
      }

      // If the path is relative inside the root directory, there's no need to
      // transform it.
      if (fullPath.startsWith('./')) {
        return unixify(`${prefix}${fullPath}`)
      }

      const relativePath = relative(rootPath, fullPath)

      // If this is a path to a node module, we're probably rendering a stack
      // trace that escaped the regex. We transform it to a deterministic path.
      if (/node_modules[/\\]/.test(relativePath)) {
        return unixify(`${prefix}/node_module/path`)
      }

      // If we're outside the root directory, we're potentially accessing
      // system directories that may vary from system to system, so we
      // normalize them to /external/path.
      if (relativePath.startsWith('..')) {
        return unixify(`${prefix}/external/path`)
      }

      return unixify(`${prefix}${relativePath}`)
    },
  ],
  // When serializing flags, Windows keep single quotes due to backslashes,
  // but not Unix
  [/: '\/file\/path'$/gm, ': /file/path'],
  // CI tests show some error messages differently
  [/\/file\/path bad option/g, 'node: bad option'],
  // Stack traces
  // @todo Remove once we drop support for Node 8.
  [/Require stack:\s+( *-\s+\S*\s{0,1})*/gm, ''],
  [/(Require stack:\n)(\s*- (.*))*/gm, '$1 REQUIRE STACK\n'],
  [/{ Error:/g, 'Error:'],
  [/^.*:\d+:\d+\)?$/gm, 'STACK TRACE'],
  [/^\s+at .*$/gm, 'STACK TRACE'],
  [/(STACK TRACE\n)+/g, 'STACK TRACE\n'],
  [/( \/file\/path){2,}/g, ' /file/path'],
  // Ports
  [/:\d{2,}/, ':80'],
  // Windows uses host:port instead of Unix sockets for TCP
  [/(http:\/\/)?localhost:80/g, '/test/socket'],
  // Durations
  [/(\d[\d.]*(ms|m|s)( )?)+/g, '1ms'],
  // Do not normalize some versions used in test
  [/(netlify-plugin-contextual-env)@(\d+)\.(\d+)\.(\d+)/g, '$1 $2-$3-$4'],
  // Package versions
  [/([@v])[\d.]+/g, '$11.0.0'],
  // Semantic versions
  [/\d+\.\d+\.\d+(-\d+)?/g, '1.0.0'],
  // npm install logs
  [/added \d+ package.*/g, 'added packages'],
  // npm install logs look different on Node 8.3.0
  [/\snpm ERR! 404([^]*npm ERR! 404)?.*/g, ''],
  [/No valid versions/g, 'No versions'],
  // Empty lines
  [/^ +$/gm, ''],
  // Hexadecimal identifiers, like commit hash
  [/[a-fA-F\d]{8,}/gm, 'HEXADECIMAL_ID'],
  // HTTP errors are shown differently in Node 8
  [/ \.\.\.:443/g, ''],
  // List of available plugins from `plugins.json`.
  // That list changes all the time, so we need to remove it.
  [/(Available plugins)[^>]*/m, '$1\n\n'],
]

module.exports = { normalizeOutput }
