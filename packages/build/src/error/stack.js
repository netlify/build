const { cleanStacks } = require('./clean_stack')

// Retrieve the stack trace
const getStackInfo = function({ message, stack, stackType }) {
  // Some errors should not show any stack trace
  if (stackType === 'none') {
    return { message }
  }

  // Some errors should show `error.stack` as is, without cleaning it
  if (stackType === 'stack') {
    return splitStack(stack)
  }

  return splitStackInfo(message)
}

// Some errors have the stack trace inside `error.message` instead of
// `error.stack` due to IPC
const splitStackInfo = function(string) {
  const { message, stack } = splitStack(string)
  if (stack === undefined) {
    return { message }
  }

  const stackA = cleanStacks(stack)
  return { message, stack: stackA }
}

const splitStack = function(string) {
  const lines = string.split('\n')
  const stackIndex = lines.findIndex(isStackTrace)

  if (stackIndex === -1) {
    return { message: string }
  }

  const messageA = lines.slice(0, stackIndex).join('\n')
  const stackA = lines.slice(stackIndex).join('\n')
  return { message: messageA, stack: stackA }
}

const isStackTrace = function(line) {
  return line.trim().startsWith('at ')
}

module.exports = { getStackInfo }
