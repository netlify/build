// Add information related to an error without colliding with existing properties
export const addDefaultErrorInfo = function (error, info) {
  if (!canHaveErrorInfo(error)) {
    return
  }

  error[CUSTOM_ERROR_KEY] = { ...info, ...error[CUSTOM_ERROR_KEY] }
}

// Retrieve error information added by our system
export const addErrorInfo = function (error, info) {
  if (!canHaveErrorInfo(error)) {
    return
  }

  error[CUSTOM_ERROR_KEY] = { ...error[CUSTOM_ERROR_KEY], ...info }
}

export const getErrorInfo = function (error) {
  if (!isBuildError(error)) {
    return [{}, error]
  }

  const { [CUSTOM_ERROR_KEY]: errorInfo, ...errorA } = error
  return [errorInfo, errorA]
}

// Change error type from one to another
export const changeErrorType = function (error, oldType, newType) {
  const [{ type }] = getErrorInfo(error)
  if (type === oldType) {
    addErrorInfo(error, { type: newType })
  }
}

export const isBuildError = function (error) {
  return canHaveErrorInfo(error) && error[CUSTOM_ERROR_KEY] !== undefined
}

// Exceptions that are not objects (including `Error` instances) cannot have an
// `CUSTOM_ERROR_KEY` property
const canHaveErrorInfo = function (error) {
  return error != null
}

export const CUSTOM_ERROR_KEY = 'customErrorInfo'
