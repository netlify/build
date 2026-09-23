import prettyMs from 'pretty-ms'

import { getFullErrorInfo } from '../../error/parse/parse.js'
import { serializeLogError } from '../../error/parse/serialize_log.js'
import type { SystemLogger } from '../../plugins_core/types.js'
import { roundTimerToMillisecs } from '../../time/measure.js'
import type { NetlifyConfig } from '../../types/config/netlify_config.js'
import { ROOT_PACKAGE_JSON } from '../../utils/json.js'
import { getLogHeaderFunc } from '../header_func.js'
import { log, logMessage, logWarning, logHeader, logSubHeader, logWarningArray, Logs } from '../logger.js'
import { OutputFlusher } from '../output_flusher.js'
import { THEME } from '../theme.js'

import { logConfigOnError } from './config.js'

export const logBuildStart = function (logs?: Logs) {
  logHeader(logs, 'Netlify Build')
  logSubHeader(logs, 'Version')
  logMessage(logs, `${ROOT_PACKAGE_JSON.name} ${ROOT_PACKAGE_JSON.version}`)
}

export const logBuildError = function ({
  error,
  netlifyConfig,
  logs,
  debug,
}: {
  error: unknown
  netlifyConfig: NetlifyConfig | undefined
  logs: Logs | undefined
  debug: boolean | undefined
}) {
  const fullErrorInfo = getFullErrorInfo({ error, colors: true, debug })
  const { severity } = fullErrorInfo
  const { title, body } = serializeLogError({ fullErrorInfo })
  const logHeaderFunc = getLogHeaderFunc(error)
  logHeaderFunc(logs, title)
  logMessage(logs, `\n${body}\n`)
  logConfigOnError({ logs, netlifyConfig, severity })
}

export const logBuildSuccess = function (logs: Logs | undefined) {
  logHeader(logs, 'Netlify Build Complete')
}

export const logTimer = function (
  logs: Logs | undefined,
  durationNs: number,
  timerName: string,
  systemLog: SystemLogger,
  outputFlusher?: OutputFlusher,
) {
  const durationMs = roundTimerToMillisecs(durationNs)
  const duration = prettyMs(durationMs)

  if (!outputFlusher || outputFlusher.flushed) {
    log(logs, '')
    log(logs, THEME.dimWords(`(${timerName} completed in ${duration})`))
  }

  systemLog(`Build step duration: ${timerName} completed in ${String(durationMs)}ms`)
}

export const logMissingSideFile = function (logs: Logs | undefined, sideFile: string, publish: string) {
  logWarning(
    logs,
    `
A "${sideFile}" file is present in the repository but is missing in the publish directory "${publish}".`,
  )
}

const ansiLink = (text: string, url: string) => `\u001B]8;;${url}\u0007${text}\u001B]8;;\u0007`

export const logLingeringProcesses = function (logs: Logs | undefined, commands: readonly string[]) {
  logWarning(
    logs,
    `
The build completed successfully, but the following processes were still running:
`,
  )
  logWarningArray(logs, commands)
  logWarning(
    logs,
    `
These processes have been terminated. In case this creates a problem for your build, refer to this ${ansiLink('article', 'https://answers.netlify.com/t/support-guide-how-to-address-the-warning-message-related-to-terminating-processes-in-builds/35277')} for details about why this process termination happens and how to fix it.`,
  )
}
