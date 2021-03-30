'use strict'

const prettyMs = require('pretty-ms')

const { name, version } = require('../../../package.json')
const { getFullErrorInfo } = require('../../error/parse/parse')
const { serializeLogError } = require('../../error/parse/serialize_log')
const { roundTimerToMillisecs } = require('../../time/measure')
const { getLogHeaderFunc } = require('../header_func')
const { log, logMessage, logWarning, logHeader, logSubHeader, logWarningArray } = require('../logger')
const { logOldCliVersionError } = require('../old_version')
const { THEME } = require('../theme')

const { logConfigOnError } = require('./config')

const logBuildStart = function (logs) {
  logHeader(logs, 'Netlify Build')
  logSubHeader(logs, 'Version')
  logMessage(logs, `${name} ${version}`)
}

const logBuildError = function ({ error, netlifyConfig, mode, logs, debug, testOpts }) {
  const fullErrorInfo = getFullErrorInfo({ error, colors: true, debug })
  const { severity } = fullErrorInfo
  const { title, body } = serializeLogError({ fullErrorInfo })
  const logHeaderFunc = getLogHeaderFunc(error)
  logHeaderFunc(logs, title)
  logMessage(logs, `\n${body}\n`)
  logConfigOnError({ logs, netlifyConfig, severity })
  logOldCliVersionError({ mode, testOpts })
}

const logBuildSuccess = function (logs) {
  logHeader(logs, 'Netlify Build Complete')
  logMessage(logs, '')
}

const logTimer = function (logs, durationNs, timerName) {
  const durationMs = roundTimerToMillisecs(durationNs)
  const duration = prettyMs(durationMs)
  log(logs, THEME.dimWords(`(${timerName} completed in ${duration})`))
}

const logLingeringProcesses = function (logs, commands) {
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
These processes have been terminated.`,
  )
}

module.exports = {
  logBuildStart,
  logBuildError,
  logBuildSuccess,
  logTimer,
  logLingeringProcesses,
}
