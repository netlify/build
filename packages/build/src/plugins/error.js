'use strict'

const { addErrorInfo } = require('../error/info')
const { logFailPluginWarning } = require('../log/messages/plugins')

// Stop build.
// As opposed to throwing an error directly or to uncaught exceptions, this is
// displayed as a user error, not an implementation error.
const failBuild = function (message, opts) {
  throw normalizeError('failBuild', failBuild, message, opts)
}

// Stop plugin. Same as `failBuild` but only stops plugin not whole build
const failPlugin = function (message, opts) {
  throw normalizeError('failPlugin', failPlugin, message, opts)
}

// Cancel build. Same as `failBuild` except it marks the build as "canceled".
const cancelBuild = function (message, opts) {
  throw normalizeError('cancelBuild', cancelBuild, message, opts)
}

// `onSuccess`, `onEnd` and `onError` cannot cancel the build since they are run
// or might be run after deployment. When calling `failBuild()` or
// `cancelBuild()`, `failPlugin()` is run instead and a warning is printed.
const failPluginWithWarning = function (methodName, event, message, opts) {
  logFailPluginWarning(methodName, event)
  failPlugin(message, opts)
}

// An `error` option can be passed to keep the original error message and
// stack trace. An additional `message` string is always required.
const normalizeError = function (type, func, message, { error } = {}) {
  const errorA = getError(error, message, func)
  addErrorInfo(errorA, { type })
  return errorA
}

const getError = function (error, message, func) {
  if (error instanceof Error) {
    error.message = `${message}\n${error.message}`
    return error
  }

  const errorA = new Error(message)
  // Do not include function itself in the stack trace
  Error.captureStackTrace(errorA, func)
  return errorA
}

module.exports = {
  failBuild,
  failPlugin,
  failPluginWithWarning,
  cancelBuild,
}
