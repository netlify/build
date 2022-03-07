import { cwd } from 'process'

import cleanStack from 'clean-stack'
import stripAnsi from 'strip-ansi'

// Clean stack traces:
//  - remove our internal code, e.g. the logic spawning plugins
//  - remove node modules and Node.js internals
//  - strip process.cwd()
//  - remove colors
// Keep non stack trace lines as is.
// We do not use libraries that patch `Error.prepareStackTrace()` because they
// tend to create issues.
export const cleanStacks = function ({ stack, rawStack, debug }) {
  if (stack === undefined) {
    return
  }

  // Internal errors / bugs keep their full stack trace
  // Same in debug mode
  if (rawStack || debug) {
    return stack
  }

  return stack.split('\n').reduce(cleanStackLine, '').replace(INITIAL_NEWLINES, '')
}

const cleanStackLine = function (lines, line) {
  const lineA = line.replace(getCwd(), '')
  const lineB = stripAnsi(lineA)

  if (!STACK_LINE_REGEXP.test(lineB)) {
    return `${lines}\n${lineA}`
  }

  if (shouldRemoveStackLine(lineB)) {
    return lines
  }

  const lineC = cleanStack(lineB)

  if (lineC === '') {
    return lines
  }

  return `${lines}\n${lineC}`
}

// `process.cwd()` can sometimes fail: directory name too long, current
// directory has been removed, access denied.
const getCwd = function () {
  try {
    return cwd()
  } catch {
    return ''
  }
}

// Check if a line is part of a stack trace
const STACK_LINE_REGEXP = /^\s+at /

const shouldRemoveStackLine = function (line) {
  const lineA = normalizePathSlashes(line)
  return INTERNAL_STACK_STRINGS.some((stackString) => lineA.includes(stackString)) || INTERNAL_STACK_REGEXP.test(lineA)
}

const INTERNAL_STACK_STRINGS = [
  // Anonymous function
  '<anonymous>',
  '(index 0)',
  // nyc internal code
  'node_modules/append-transform',
  'node_modules/signal-exit',
  // Node internals
  '(node:',
]

// This is only needed for local builds and tests
const INTERNAL_STACK_REGEXP = /(packages|@netlify)\/build\/(src\/|tests\/helpers\/|tests\/.*\/tests.js|node_modules)/

const INITIAL_NEWLINES = /^\n+/

const normalizePathSlashes = function (line) {
  return line.replace(BACKLASH_REGEXP, '/')
}

const BACKLASH_REGEXP = /\\/g
