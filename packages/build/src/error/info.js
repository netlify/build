'use strict'

// Add information related to an error without colliding with existing properties
const addDefaultErrorInfo = function (error, info) {
  if (!canHaveErrorInfo(error)) {
    return
  }

  error[INFO_SYM] = { ...info, ...error[INFO_SYM] }
}

const addErrorInfo = function (error, info) {
  if (!canHaveErrorInfo(error)) {
    return
  }

  error[INFO_SYM] = { ...error[INFO_SYM], ...info }
}

const getErrorInfo = function (error) {
  if (!isBuildError(error)) {
    return [{}, error]
  }

  const { [INFO_SYM]: errorInfo, ...errorA } = error
  return [errorInfo, errorA]
}

const isBuildError = function (error) {
  return canHaveErrorInfo(error) && error[INFO_SYM] !== undefined
}

// Exceptions that are not objects (including `Error` instances) cannot have an
// `INFO_SYM` property
const canHaveErrorInfo = function (error) {
  return error != null
}

const INFO_SYM = 'errorInfo'

module.exports = { addDefaultErrorInfo, addErrorInfo, getErrorInfo, isBuildError }
