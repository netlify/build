// Stop build.
// As opposed to throwing an error directly or to uncaught exceptions, this is
// displayed as a user error, not an implementation error.
const fail = function(message, opts) {
  throw normalizeError('fail', fail, message, opts)
}

// Cancel build. Same as `fail` except it marks the build as "canceled".
const cancel = function(message, opts) {
  throw normalizeError('cancel', cancel, message, opts)
}

// An `error` option can be passed to keep the original error message and
// stack trace. An additional `message` string is always required.
const normalizeError = function(type, func, message, { error } = {}) {
  const errorA = getError(error, message, func)
  errorA[ERROR_TYPE_SYM] = type
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

const ERROR_TYPE_SYM = Symbol('errorType')

module.exports = { fail, cancel, ERROR_TYPE_SYM }
