import { getLogHeaderFunc } from '../header_func.js'
import { log, logMessage } from '../logger.js'
import { THEME } from '../theme.js'

export const logStepStart = function ({ logs, event, packageName, coreStepDescription, error, netlifyConfig }) {
  const description = getDescription({ coreStepDescription, netlifyConfig, packageName, event })
  const logHeaderFunc = getLogHeaderFunc(error)
  logHeaderFunc(logs, `${description}`)
  logMessage(logs, '')
}

const getDescription = function ({ coreStepDescription, netlifyConfig, packageName, event }) {
  return coreStepDescription === undefined ? `${packageName} (${event} event)` : coreStepDescription({ netlifyConfig })
}

export const logBuildCommandStart = function (logs, buildCommand) {
  log(logs, THEME.highlightWords(`$ ${buildCommand}`))
}
