const { cwd } = require('process')

const cleanStack = require('clean-stack')
const stripAnsi = require('strip-ansi')

// Clean stack traces:
//  - remove our internal code, e.g. the logic spawning plugins
//  - remove node modules and Node.js internals
//  - strip process.cwd()
//  - remove colors
// Keep non stack trace lines as is.
// We do not use libraries that patch `Error.prepareStackTrace()` because they
// tend to create issues.
const cleanStacks = function(string, rawStack) {
  // Internal errors / bugs keep their full stack trace
  if (rawStack || string === undefined) {
    return string
  }

  return String(string)
    .split('\n')
    .reduce(cleanStackLine, '')
    .replace(INITIAL_NEWLINES, '')
}

const cleanStackLine = function(lines, line) {
  const lineA = line.replace(getCwd(), '')
  const lineB = stripAnsi(lineA)

  if (!STACK_LINE_REGEXP.test(lineB)) {
    return `${lines}\n${lineA}`
  }

  if (isUselessStack(lineB)) {
    return lines
  }

  if (isInternalStack(lineB)) {
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
const getCwd = function() {
  try {
    return cwd()
  } catch (error) {
    return ''
  }
}

// Check if a line is part of a stack trace
const STACK_LINE_REGEXP = /^\s+at /

const isUselessStack = function(line) {
  const lineA = normalizePathSlashes(line)
  return (
    // Anonymous function
    lineA.includes('<anonymous>') ||
    lineA.includes('(index 0)') ||
    // nyc internal code
    lineA.includes('node_modules/append-transform') ||
    lineA.includes('node_modules/signal-exit')
  )
}

// This is only needed for local builds and tests
const isInternalStack = function(line) {
  const lineA = normalizePathSlashes(line)
  return INTERNAL_STACK_REGEXP.test(lineA)
}

const INTERNAL_STACK_REGEXP = /(packages|@netlify)\/build\/(src\/|tests\/helpers\/|tests\/.*\/tests.js|node_modules)/

const INITIAL_NEWLINES = /^\n+/

const normalizePathSlashes = function(line) {
  return line.replace(BACKLASH_REGEXP, '/')
}

const BACKLASH_REGEXP = /\\/g

module.exports = { cleanStacks }
