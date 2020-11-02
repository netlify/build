'use strict'

const { parseErrorInfo } = require('../error/parse/parse')

const { logHeader, logErrorHeader } = require('./logger')

// Retrieve successful or error header depending on whether `error` exists
const getLogHeaderFunc = function (error) {
  if (error === undefined) {
    return logHeader
  }

  const { severity } = parseErrorInfo(error)
  if (severity === 'none') {
    return logHeader
  }

  return logErrorHeader
}

module.exports = { getLogHeaderFunc }
