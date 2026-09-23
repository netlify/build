import type { NetlifyConfig } from '../../types/config/netlify_config.js'
import { getLogHeaderFunc } from '../header_func.js'
import { type Logs, log, logMessage } from '../logger.js'
import { THEME } from '../theme.js'

export type CoreStepDescription = (args: { netlifyConfig: NetlifyConfig }) => string

// Core steps always have a description, plugin steps always have a package name
export type StepDescriptionSource =
  | { coreStepDescription: CoreStepDescription; packageName?: string | undefined }
  | { coreStepDescription?: undefined; packageName: string }

type DescribedStep = StepDescriptionSource & { event: string; netlifyConfig: NetlifyConfig }

export const logStepStart = function ({
  logs,
  error,
  ...step
}: DescribedStep & { logs: Logs | undefined; error?: Error | undefined }) {
  const description = getDescription(step)
  const logHeaderFunc = getLogHeaderFunc(error)
  logHeaderFunc(logs, description)
  logMessage(logs, '')
}

const getDescription = function ({ coreStepDescription, netlifyConfig, packageName, event }: DescribedStep) {
  return coreStepDescription === undefined ? `${packageName} (${event} event)` : coreStepDescription({ netlifyConfig })
}

export const logBuildCommandStart = function (logs: Logs | undefined, buildCommand: string) {
  log(logs, THEME.highlightWords(`$ ${buildCommand}`))
}
