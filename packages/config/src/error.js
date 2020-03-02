// We distinguish between errors thrown intentionally and uncaught exceptions
// (such as bugs) with a `type` property.
const throwError = function(messageOrError, error) {
  const errorA = getError(messageOrError, error)
  errorA.type = 'userError'
  throw errorA
}

// Can pass either `message`, `error` or `message, error`
const getError = function(messageOrError, error) {
  if (messageOrError instanceof Error) {
    return messageOrError
  }

  if (error === undefined) {
    return new Error(messageOrError)
  }

  error.message = `${messageOrError}\n${error.message}`
  return error
}

module.exports = { throwError }
