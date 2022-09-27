// We distinguish between errors thrown intentionally and uncaught exceptions
// (such as bugs) with a `customErrorInfo.type` property.
export const throwUserError = function (messageOrError, error) {
  const errorA = getError(messageOrError, error)
  errorA[CUSTOM_ERROR_KEY] = { type: USER_ERROR_TYPE }
  throw errorA
}

// Can pass either `message`, `error` or `message, error`
const getError = function (messageOrError, error) {
  if (messageOrError instanceof Error) {
    return messageOrError
  }

  if (error === undefined) {
    return new Error(messageOrError)
  }

  error.message = `${messageOrError}\n${error.message}`
  return error
}

export const isUserError = function (error) {
  return (
    canHaveErrorInfo(error) && error[CUSTOM_ERROR_KEY] !== undefined && error[CUSTOM_ERROR_KEY].type === USER_ERROR_TYPE
  )
}

// Exceptions that are not objects (including `Error` instances) cannot have an
// `CUSTOM_ERROR_KEY` property
const canHaveErrorInfo = function (error) {
  return error != null
}

const CUSTOM_ERROR_KEY = 'customErrorInfo'
const USER_ERROR_TYPE = 'resolveConfig'
