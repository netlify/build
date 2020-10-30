'use strict'

// Add information related to an error without colliding with existing properties
const addErrorInfo = function (error, info) {
  if (!canHaveErrorInfo(error)) {
    return
  }

  error[INFO_SYM] = { ...error[INFO_SYM], ...info }
}

const getErrorInfo = function (error) {
  if (!isBuildError(error)) {
    return {}
  }

  return error[INFO_SYM]
}

const isBuildError = function (error) {
  return canHaveErrorInfo(error) && error[INFO_SYM] !== undefined
}

// Exceptions that are not objects (including `Error` instances) cannot have an
// `INFO_SYM` property
const canHaveErrorInfo = function (error) {
  return error != null
}

const INFO_SYM = Symbol('info')

module.exports = { addErrorInfo, getErrorInfo, isBuildError, INFO_SYM }
