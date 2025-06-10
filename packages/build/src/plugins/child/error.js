import logProcessErrors from 'log-process-errors'

import { errorToJson } from '../../error/build.js'
import { addDefaultErrorInfo } from '../../error/info.js'
import { normalizeError } from '../../error/parse/normalize.js'
import { sendEventToParent } from '../ipc.js'

// Handle any top-level error and communicate it back to parent
export const handleError = async function (error, verbose) {
  const errorA = normalizeError(error)
  addDefaultErrorInfo(errorA, { type: 'pluginInternal' })
  const errorPayload = errorToJson(errorA)
  await sendEventToParent('error', errorPayload, verbose, errorA)
}

// On uncaught exceptions and unhandled rejections, print the stack trace.
// Also, prevent child processes from crashing on uncaught exceptions.
export const handleProcessErrors = function () {
  logProcessErrors({ onError: handleProcessError, exit: false })
}

const handleProcessError = async function (error, event) {
  if (event === 'warning') {
    console.warn(error)
    return
  }

  await handleError(error)
}
