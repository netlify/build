// Add information related to an error without colliding with existing properties
const addErrorInfo = function(error, info) {
  error[INFO_SYM] = { ...error[INFO_SYM], ...info }
}

const getErrorInfo = function(error) {
  return error[INFO_SYM] || {}
}

const isBuildError = function(error) {
  return error instanceof Error && error[INFO_SYM] !== undefined
}

const INFO_SYM = Symbol('info')

module.exports = { addErrorInfo, getErrorInfo, isBuildError, INFO_SYM }
