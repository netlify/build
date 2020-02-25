// Stop build.
// As opposed to throwing an error directly or to uncaught exceptions, this is
// displayed as a user error, not an implementation error.
const fail = function(errorOrMessage) {
  const errorA = errorOrMessage instanceof Error ? errorOrMessage : new Error(errorOrMessage)
  // Do not include `fail()` itself in the stack trace
  Error.captureStackTrace(errorA, fail)
  errorA[ERROR_TYPE_SYM] = 'fail'
  throw errorA
}

const ERROR_TYPE_SYM = Symbol('errorType')

module.exports = { fail, ERROR_TYPE_SYM }
