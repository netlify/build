// Add information related to an error without colliding with existing properties
const addErrorInfo = function(error, info) {
  error[INFO_SYM] = { ...error[INFO_SYM], ...info }
}

const getErrorInfo = function(error) {
  return error[INFO_SYM] || {}
}

const INFO_SYM = Symbol('info')

module.exports = { addErrorInfo, getErrorInfo, INFO_SYM }
