import { handleBuildError } from '../error/handle.js'

import { execBuild, startBuild } from './build.js'
import { getSeverity } from './severity.js'

export const startDev = async (devCommand, flags = {}) => {
  const { errorMonitor, mode, logs, debug, testOpts, ...normalizedFlags } = startBuild(flags)
  const errorParams = { errorMonitor, mode, logs, debug, testOpts }

  try {
    const { netlifyConfig: netlifyConfigA, configMutations } = await execBuild({
      ...normalizedFlags,
      errorMonitor,
      errorParams,
      mode,
      logs,
      debug,
      testOpts,
      timeline: 'dev',
      devCommand,
    })
    const { success, severityCode } = getSeverity('success')

    return { success, severityCode, netlifyConfig: netlifyConfigA, logs, configMutations }
  } catch (error) {
    const { severity, message, stack } = await handleBuildError(error, errorParams)
    const { success, severityCode } = getSeverity(severity)

    return { success, severityCode, logs, error: { message, stack } }
  }
}
