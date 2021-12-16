import ansiEscapes from 'ansi-escapes'
import prettyMs from 'pretty-ms'

import { getFullErrorInfo } from '../../error/parse/parse.js'
import { serializeLogError } from '../../error/parse/serialize_log.js'
import { roundTimerToMillisecs } from '../../time/measure.js'
import { ROOT_PACKAGE_JSON } from '../../utils/json.js'
import { getLogHeaderFunc } from '../header_func.js'
import { log, logMessage, logWarning, logHeader, logSubHeader, logWarningArray } from '../logger.js'
import { logOldCliVersionError } from '../old_version.js'
import { THEME } from '../theme.js'

import { logConfigOnError } from './config.js'

export const logBuildStart = function (logs) {
  logHeader(logs, 'Netlify Build')
  logSubHeader(logs, 'Version')
  logMessage(logs, `${ROOT_PACKAGE_JSON.name} ${ROOT_PACKAGE_JSON.version}`)
}

export const logBuildError = function ({ error, netlifyConfig, mode, logs, debug, testOpts }) {
  const fullErrorInfo = getFullErrorInfo({ error, colors: true, debug })
  const { severity } = fullErrorInfo
  const { title, body } = serializeLogError({ fullErrorInfo })
  const logHeaderFunc = getLogHeaderFunc(error)
  logHeaderFunc(logs, title)
  logMessage(logs, `\n${body}\n`)
  logConfigOnError({ logs, netlifyConfig, severity })
  logOldCliVersionError({ mode, testOpts })
}

export const logBuildSuccess = function (logs) {
  logHeader(logs, 'Netlify Build Complete')
  logMessage(logs, '')
}

export const logTimer = function (logs, durationNs, timerName) {
  const durationMs = roundTimerToMillisecs(durationNs)
  const duration = prettyMs(durationMs)
  log(logs, THEME.dimWords(`(${timerName} completed in ${duration})`))
}

export const logMissingSideFile = function (logs, sideFile, publish) {
  logWarning(
    logs,
    `
A "${sideFile}" file is present in the repository but is missing in the publish directory "${publish}".`,
  )
}

// @todo use `terminal-link` (https://github.com/sindresorhus/terminal-link)
// instead of `ansi-escapes` once
// https://github.com/jamestalmage/supports-hyperlinks/pull/12 is fixed
export const logLingeringProcesses = function (logs, commands) {
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
These processes have been terminated. In case this creates a problem for your build, refer to this ${ansiEscapes.link(
      'article',
      'https://answers.netlify.com/t/support-guide-how-to-address-the-warning-message-related-to-terminating-processes-in-builds/35277',
    )} for details about why this process termination happens and how to fix it.`,
  )
}
