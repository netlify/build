import { relative } from 'path'
import { fileURLToPath } from 'url'

import figures from 'figures'
import stripAnsi from 'strip-ansi'

const rootPath = fileURLToPath(new URL('../../..', import.meta.url))
const unixify = (path) => path.replace(/\\/gu, '/')
const UNICODE_BACKSLASH_SEQUENCE = /^\/u\d+/iu

const NORMALIZE_REGEXPS = [
  // Zero width space characters due to a bug in buildbot:
  // https://github.com/netlify/buildbot/issues/595
  [/\u{200B}/gu, ''],
  // Some error messages have one less newline on Windows.
  // "but got 0" is the end of one of them (from `tsc`) used in one test.
  [/(but got 0.)\r\n/gu, '$1\n\n'],
  // Windows specifics
  [/\r\n/gu, '\n'],
  [/\\r\\n/gu, '\\n'],
  [/\\{1,2}/gu, '/'],
  [/Program Files/gu, 'ProgramFiles'],
  [new RegExp(figures.tick, 'g'), '√'],
  [new RegExp(figures.pointer, 'g'), '>'],
  [new RegExp(figures.arrowDown, 'g'), '↓'],
  [/⚠/gu, '‼'],
  [/(\/\/"[^"]+\/\/":\/\/"node:[^"]+\/\/",)+/g, '//"builtins//"://"node:builtins//",'],
  [/(\/"[^"]+\/":\/"node:[^"]+\/",)+/g, '/"builtins/":/"node:builtins/",'],
  // A bug in nyc (https://github.com/istanbuljs/istanbuljs/issues/141) is
  // creating those error messages on Windows. This happens randomly and
  // seldomly. This might be fixed by nyc@15
  [/Transformation error for .*\n/g, ''],
  [/EPERM: operation not permitted, rename .*\n/g, ''],
  // File paths
  [/Caching [.~]\//g, 'Caching '],
  [/(tests\/.*\/fixtures\/.*\.(?:js|ts))(:(\d)+:(\d)+:)/g, '$1'],
  // Normalizes any paths so that they're relative to process.cwd().
  [
    /(^|[ "'(=])((?:\.{0,2}|([A-Z]:)|file:\/\/)(\/[^ "')\n]+))/gm,

    (_, prefix, pathMatch, winDrive, pathTrail) => {
      // If we're dealing with a file URL, we convert it to a path.
      const path = pathMatch.startsWith('file://') ? fileURLToPath(pathMatch) : pathMatch

      // If we're dealing with a Windows path, we discard the drive letter.
      const fullPath = winDrive ? pathTrail : path
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

      if (isEscapeSequence(fullPath)) {
        return `${prefix}${fullPath}`
      }

      // If the path is relative inside the root directory, there's no need to
      // transform it.
      if (fullPath.startsWith('./')) {
        return unixify(`${prefix}${fullPath}`)
      }

      const relativePath = relative(rootPath, fullPath)

      if (relativePath === '') {
        return `${prefix}/`
      }

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
  [/Require stack:\s+( *-\s+\S*\s{0,1})*/gm, ''],
  [/{ Error:/g, 'Error:'],
  [/^.*:\d+:\d+\)?$/gm, 'STACK TRACE'],
  [/^\s+at .*$/gm, 'STACK TRACE'],
  [/(STACK TRACE\n)+/g, 'STACK TRACE\n'],
  [/( \/file\/path){2,}/g, ' /file/path'],
  // Ports
  [/:\d{2,}/g, ':80'],
  // Windows uses host:port instead of Unix sockets for TCP
  [/(http:\/\/)?localhost:80/g, '/test/socket'],
  // Durations
  [/(\d[\d.]*(ms|m|s)( )?)+/g, '1ms'],
  // Do not normalize some versions used in test
  [/(netlify-plugin-contextual-env)@(\d+)\.(\d+)\.(\d+)/g, '$1 $2-$3-$4'],
  [/(latest|expected|compatible|pinned|latest version is) (\d+)\.(\d+)\.(\d+)/g, '$1 $2-$3-$4'],
  // Package versions
  [/([@v])[\d.]+/g, '$11.0.0'],
  // Semantic versions
  [/\d+\.\d+\.\d+(-\w+)?/g, '1.0.0'],
  // npm install logs
  [/added \d+ package.*/g, 'added packages'],
  // npm install logs look different on Node 8.3.0
  [/\snpm ERR! 404([^]*npm ERR! 404)?.*/g, ''],
  [/No valid versions/g, 'No versions'],
  // npm error logs are shown differently in CI
  [/\s*npm ERR!\s+\/external\/path/g, ''],
  // TypeScript ES proposals differ per Node versions
  [/es\d{4}/g, 'es2000'],
  [/.*es(2000\.|1).*\n/g, ''],
  [/^(\s+"es2000"),/gm, '$1'],
  // Empty lines
  [/^ +$/gm, ''],
  // Hexadecimal identifiers, like commit hash or UUID
  [/[a-fA-F-\d]{8,}/gm, 'HEXADECIMAL_ID'],
  // HTTP errors are shown differently in Node 8
  [/ \.\.\.:443/g, ''],
  // List of available plugins from `plugins.json`.
  // That list changes all the time, so we need to remove it.
  [/(Available plugins)[^>]*/m, '$1\n\n'],
  // esbuild error messages
  [/(Could not resolve "[^"]+") \([^)]+\)/g, '$1'],
  // Transient network errors in edge function type checking
  [
    /Could not check latest version of types:.*\n.*STACK TRACE\n/g,
    'Local version of types is up-to-date: HEXADECIMAL_ID\n',
  ],
  // Transient network errors when loading edge function config
  [/Could not load configuration for edge function[^\n]*\n(.*error:.*\n)*(.*STACK TRACE\n)?/g, ''],
  // Base64-encoded string
  [/data:.*;base64,([a-zA-Z\d=])+/g, 'BASE64_STRING'],
]

/** Check if what appears to be a Windows file paths is actually an escape sequence like \n */
const isEscapeSequence = (string: string) => string.length <= 2 || UNICODE_BACKSLASH_SEQUENCE.test(string)

/** Normalize log output so it can be snapshot consistently across test runs */
export const normalizeOutput = (output: string): string => NORMALIZE_REGEXPS.reduce(replaceOutput, stripAnsi(output))

const replaceOutput = (output: string, [regExp, replacement]: [RegExp, string]) => output.replace(regExp, replacement)
