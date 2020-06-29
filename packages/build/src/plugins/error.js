const { addErrorInfo } = require('../error/info')

// Stop build.
// As opposed to throwing an error directly or to uncaught exceptions, this is
// displayed as a user error, not an implementation error.
const failBuild = function(message, opts) {
  throw normalizeError('failBuild', failBuild, message, opts)
}

// Stop plugin. Same as `failBuild` but only stops plugin not whole build
const failPlugin = function(message, opts) {
  throw normalizeError('failPlugin', failPlugin, message, opts)
}

// Cancel build. Same as `failBuild` except it marks the build as "canceled".
const cancelBuild = function(message, opts) {
  throw normalizeError('cancelBuild', cancelBuild, message, opts)
}

// An `error` option can be passed to keep the original error message and
// stack trace. An additional `message` string is always required.
const normalizeError = function(type, func, message, { error } = {}) {
  const errorA = getError(error, message, func)
  addErrorInfo(errorA, { type })
  return errorA
}

const getError = function(error, message, func) {
  if (error instanceof Error) {
    error.message = `${message}\n${error.message}`
    return error
  }

  const errorA = new Error(message)
  // Do not include function itself in the stack trace
  Error.captureStackTrace(errorA, func)
  return errorA
}

const validateOldProperty = function(obj, propName, message) {
  if (obj[propName] === undefined) {
    return
  }

  const error = new Error(message)
  addErrorInfo(error, { type: 'pluginValidation' })
  throw error
}

module.exports = {
  failBuild,
  failPlugin,
  cancelBuild,
  validateOldProperty,
}
