import { logMessage, logHeader, logSubHeader } from '../logger.js'
import { THEME } from '../theme.js'

export const logStatuses = function (logs, statuses) {
  logHeader(logs, 'Summary')
  statuses.forEach((status) => {
    logStatus(logs, status)
  })
}

const logStatus = function (logs, { packageName, title = `Plugin ${packageName} ran successfully`, summary, text }) {
  const titleA = title.includes(packageName) ? title : `${packageName}: ${title}`
  const body = text === undefined ? summary : `${summary}\n${THEME.dimWords(text)}`
  logSubHeader(logs, titleA)
  logMessage(logs, body)
}
