import { parseErrorInfo } from '../error/parse/parse.js'

import { logHeader, logErrorHeader } from './logger.js'

// Retrieve successful or error header depending on whether `error` exists
export const getLogHeaderFunc = function (error) {
  if (error === undefined) {
    return logHeader
  }

  const { severity } = parseErrorInfo(error)
  if (severity === 'none') {
    return logHeader
  }

  return logErrorHeader
}
