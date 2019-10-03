const {
  env: { DEBUG_BUILD }
} = require('process')

const StackUtils = require('stack-utils')
const cleanStackLib = require('clean-stack')

/*
 * Given a string value of the format generated for the `stack` property of a
 * V8 error object, return a string that contains only stack frame information
 * for frames that have relevance to the consumer.
 *
 * For example, given the following string value:
 *
 * ```
 * Error
 *     at inner (/home/ava/ex.js:7:12)
 *     at /home/ava/ex.js:12:5
 *     at outer (/home/ava/ex.js:13:4)
 *     at Object.<anonymous> (/home/ava/ex.js:14:3)
 *     at Module._compile (module.js:570:32)
 *     at Object.Module._extensions..js (module.js:579:10)
 *     at Module.load (module.js:487:32)
 *     at tryModuleLoad (module.js:446:12)
 *     at Function.Module._load (module.js:438:3)
 *     at Module.runMain (module.js:604:10)
 * ```
 *
 * ...this function returns the following string value:
 *
 * ```
 * inner (/home/ava/ex.js:7:12)
 * /home/ava/ex.js:12:5
 * outer (/home/ava/ex.js:13:4)
 * Object.<anonymous> (/home/ava/ex.js:14:3)
 * ```
 */
const cleanStack = function(stack) {
  const stackA = extractFrames(stack)
  // Workaround for https://github.com/tapjs/stack-utils/issues/14
  // TODO: fix it in `stack-utils`
  const stackB = cleanStackLib(stackA)

  return (
    stackUtils
      .clean(stackB)
      // Remove the trailing newline inserted by the `stack-utils` module
      .trim()
      .split('\n')
      .map(removeFilePrefix)
      .join('\n')
  )
}

const extractFrames = function(stack) {
  return stack
    .split('\n')
    .map(trimLine)
    .filter(isFrame)
    .join('\n')
}

const trimLine = function(line) {
  return line.trim()
}

const isFrame = function(line) {
  return STACK_FRAME_LINE_REGEXP.test(line)
}

const STACK_FRAME_LINE_REGEXP = /^.+( \(.+:\d+:\d+\)|:\d+:\d+)$/

const getStackUtils = function() {
  const options = DEBUG_BUILD ? { internals: StackUtils.nodeInternals() } : {}
  return new StackUtils(options)
}

const stackUtils = getStackUtils()

// Remove remaining file:// prefixes, inserted by `esm`, that are not cleaned
// up by `stack-utils`
const removeFilePrefix = function(line) {
  return line.replace(FILE_PREFIX_REGEXP, '($1)')
}

const FILE_PREFIX_REGEXP = /\(file:\/\/([^/].+:\d+:\d+)\)$/

module.exports = { cleanStack }
