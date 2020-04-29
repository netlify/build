// eslint-disable-next-line import/order
const logProcessErrors = require('log-process-errors')

const { hasColors } = require('../../log/colors')
const { isBuildError, ERROR_TYPE_SYM } = require('../error')
const { sendEventToParent } = require('../ipc')

// Handle any top-level error and communicate it back to parent
const handleError = async function({
  name,
  message,
  stack,
  [ERROR_TYPE_SYM]: type = DEFAULT_ERROR_TYPE,
  ...errorProps
}) {
  await sendEventToParent('error', { name, message, stack, type, errorProps })
}

const DEFAULT_ERROR_TYPE = 'pluginInternal'

// On uncaught exceptions and unhandled rejections, print the stack trace.
// Also, prevent child processes from crashing on uncaught exceptions.
const handleProcessErrors = function() {
  logProcessErrors({ log: handleProcessError, colors: hasColors(), exitOn: [], level: { multipleResolves: 'silent' } })
}

const handleProcessError = async function(error, level, originalError) {
  if (level !== 'error') {
    console[level](error)
    return
  }

  // Do not use log-process-errors prettification with errors thrown by `utils.build.*`
  const errorA = isBuildError(originalError) ? originalError : error

  await handleError(errorA)
}

module.exports = { handleError, handleProcessErrors }
