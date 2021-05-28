'use strict'

const { getLogHeaderFunc } = require('../header_func')
const { log, logMessage } = require('../logger')
const { THEME } = require('../theme')

const logCommand = function ({ logs, event, packageName, coreCommandDescription, index, error, netlifyConfig }) {
  const description = getDescription({ coreCommandDescription, netlifyConfig, packageName, event })
  const logHeaderFunc = getLogHeaderFunc(error)
  logHeaderFunc(logs, `${index + 1}. ${description}`)
  logMessage(logs, '')
}

const getDescription = function ({ coreCommandDescription, netlifyConfig, packageName, event }) {
  return coreCommandDescription === undefined
    ? `${event} command from ${packageName}`
    : coreCommandDescription({ netlifyConfig })
}

const logBuildCommandStart = function (logs, buildCommand) {
  log(logs, THEME.highlightWords(`$ ${buildCommand}`))
}

const logCommandSuccess = function (logs) {
  logMessage(logs, '')
}

module.exports = {
  logCommand,
  logBuildCommandStart,
  logCommandSuccess,
}
