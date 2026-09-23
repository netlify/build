import type { PluginStatus } from '../../status/add.js'
import { type Logs, logMessage, logHeader, logSubHeader } from '../logger.js'
import { THEME } from '../theme.js'

// Only statuses with a `summary` are printed
type PrintedStatus = Pick<PluginStatus, 'packageName' | 'title' | 'text'> & { summary: string }

export const logStatuses = function (logs: Logs | undefined, statuses: PrintedStatus[]) {
  logHeader(logs, 'Summary')
  statuses.forEach((status) => {
    logStatus(logs, status)
  })
}

const logStatus = function (
  logs: Logs | undefined,
  { packageName, title = `Plugin ${packageName} ran successfully`, summary, text }: PrintedStatus,
) {
  const titleA = title.includes(packageName) ? title : `${packageName}: ${title}`
  const body = text === undefined ? summary : `${summary}\n${THEME.dimWords(text)}`
  logSubHeader(logs, titleA)
  logMessage(logs, body)
}
