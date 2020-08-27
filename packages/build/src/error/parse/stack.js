const { cleanStacks } = require('./clean_stack')

// Retrieve the stack trace
const getStackInfo = function({ message, stack, stackType, rawStack, isSuccess, debug }) {
  const { message: messageA, stack: stackA } = splitStackInfo({ message, stack, stackType })
  const messageB = isSuccess ? messageA.replace(SUCCESS_ERROR_NAME, '') : messageA
  const stackB = cleanStacks({ stack: stackA, rawStack, debug })
  return { message: messageB, stack: stackB }
}

const splitStackInfo = function({ message, stack, stackType }) {
  // Some errors should not show any stack trace
  if (stackType === 'none') {
    return { message }
  }

  // Some errors have their stack trace inside `error.message` instead of
  // `error.stack` due to IPC
  if (stackType === 'message') {
    return splitStack(message)
  }

  return splitStack(stack)
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

const SUCCESS_ERROR_NAME = 'Error: '

module.exports = { getStackInfo }
