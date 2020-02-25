// Stop build.
// As opposed to throwing an error directly or to uncaught exceptions, this is
// displayed as a user error, not an implementation error.
const fail = function(errorOrMessage) {
  throw normalizeError(errorOrMessage, 'fail', fail)
}

const normalizeError = function(errorOrMessage, type, func) {
  const errorA = errorOrMessage instanceof Error ? errorOrMessage : new Error(errorOrMessage)
  // Do not include function itself in the stack trace
  Error.captureStackTrace(errorA, func)
  errorA[ERROR_TYPE_SYM] = type
  return errorA
}

const ERROR_TYPE_SYM = Symbol('errorType')

module.exports = { fail, ERROR_TYPE_SYM }
