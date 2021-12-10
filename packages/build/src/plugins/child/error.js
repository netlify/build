'use strict'

const logProcessErrors = require('log-process-errors')

const { errorToJson } = require('../../error/build')
const { addDefaultErrorInfo, isBuildError } = require('../../error/info')
const { normalizeError } = require('../../error/parse/normalize')
const { sendEventToParent } = require('../ipc')

// Handle any top-level error and communicate it back to parent
const handleError = async function (error, verbose) {
  const errorA = normalizeError(error)
  addDefaultErrorInfo(errorA, { type: 'pluginInternal' })
  const errorPayload = errorToJson(errorA)
  await sendEventToParent('error', errorPayload, verbose, errorA)
}

// On uncaught exceptions and unhandled rejections, print the stack trace.
// Also, prevent child processes from crashing on uncaught exceptions.
const handleProcessErrors = function () {
  logProcessErrors({ log: handleProcessError, exitOn: [], level: { multipleResolves: 'silent' } })
}

const handleProcessError = async function (error, level, originalError) {
  if (level !== 'error') {
    console[level](error)
    return
  }

  // Do not use log-process-errors prettification with errors thrown by `utils.build.*`
  const errorA = isBuildError(originalError) ? originalError : error

  await handleError(errorA)
}

module.exports = { handleError, handleProcessErrors }
