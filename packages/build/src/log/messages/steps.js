'use strict'

const { getLogHeaderFunc } = require('../header_func')
const { log, logMessage } = require('../logger')
const { THEME } = require('../theme')

const logStepStart = function ({ logs, event, packageName, coreStepDescription, index, error, netlifyConfig }) {
  const description = getDescription({ coreStepDescription, netlifyConfig, packageName, event })
  const logHeaderFunc = getLogHeaderFunc(error)
  logHeaderFunc(logs, `${index + 1}. ${description}`)
  logMessage(logs, '')
}

const getDescription = function ({ coreStepDescription, netlifyConfig, packageName, event }) {
  return coreStepDescription === undefined
    ? `${event} step from ${packageName}`
    : coreStepDescription({ netlifyConfig })
}

const logBuildCommandStart = function (logs, buildCommand) {
  log(logs, THEME.highlightWords(`$ ${buildCommand}`))
}

const logStepSuccess = function (logs) {
  logMessage(logs, '')
}

module.exports = {
  logStepStart,
  logBuildCommandStart,
  logStepSuccess,
}
