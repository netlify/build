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
const cleanStacks = function(string) {
  return String(string)
    .split('\n')
    .reduce(cleanStackLine, '')
}

const cleanStackLine = function(lines, line) {
  const lineA = line.replace(cwd(), '')
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

// Check if a line is part of a stack trace
const STACK_LINE_REGEXP = /^\s+at /

const isUselessStack = function(line) {
  const lineA = line.replace(BACKLASH_REGEXP, '/')
  return (
    // Anonymous function
    lineA.includes('<anonymous>') ||
    // nyc internal code
    lineA.includes('node_modules/append-transform') ||
    lineA.includes('node_modules/signal-exit')
  )
}

const BACKLASH_REGEXP = /\\/g

const isInternalStack = function(line) {
  // This is only needed for local builds
  return INTERNAL_STACK_REGEXP.test(line)
}

const INTERNAL_STACK_REGEXP = /packages[/\\]build[/\\](src|node_modules)[/\\]/

module.exports = { cleanStacks }
