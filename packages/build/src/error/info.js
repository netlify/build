'use strict'

// Add information related to an error without colliding with existing properties
const addDefaultErrorInfo = function (error, info) {
  if (!canHaveErrorInfo(error)) {
    return
  }

  error[CUSTOM_ERROR_KEY] = { ...info, ...error[CUSTOM_ERROR_KEY] }
}

// Retrieve error information added by our system
const addErrorInfo = function (error, info) {
  if (!canHaveErrorInfo(error)) {
    return
  }

  error[CUSTOM_ERROR_KEY] = { ...error[CUSTOM_ERROR_KEY], ...info }
}

const getErrorInfo = function (error) {
  if (!isBuildError(error)) {
    return [{}, error]
  }

  const { [CUSTOM_ERROR_KEY]: errorInfo, ...errorA } = error
  return [errorInfo, errorA]
}

const isBuildError = function (error) {
  return canHaveErrorInfo(error) && error[CUSTOM_ERROR_KEY] !== undefined
}

// Exceptions that are not objects (including `Error` instances) cannot have an
// `CUSTOM_ERROR_KEY` property
const canHaveErrorInfo = function (error) {
  return error != null
}

const CUSTOM_ERROR_KEY = 'customErrorInfo'

module.exports = { addDefaultErrorInfo, addErrorInfo, getErrorInfo, isBuildError, CUSTOM_ERROR_KEY }
