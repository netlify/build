'use strict'

const prettyMs = require('pretty-ms')

const { name, version } = require('../../../package.json')
const { getFullErrorInfo } = require('../../error/parse/parse')
const { serializeLogError } = require('../../error/parse/serialize_log')
const { roundTimerToMillisecs } = require('../../time/measure')
const { getLogHeaderFunc } = require('../header_func')
const { log, logMessage, logHeader, logSubHeader } = require('../logger')
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

const logLingeringProcesses = function (logs, processList) {
  log(
    logs,
    THEME.errorLine(`
** WARNING **
There are some lingering processes even after the build process finished:

${processList}

Our builds do not kill your processes automatically, so please make sure
that nothing is running after your build finishes, or it will be marked as
failed since something is still running.`),
  )
}

module.exports = {
  logBuildStart,
  logBuildError,
  logBuildSuccess,
  logTimer,
  logLingeringProcesses,
}
