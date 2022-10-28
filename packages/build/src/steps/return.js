import { logTimer } from '../log/messages/core.js'
import { logStepSuccess } from '../log/messages/steps.js'

import { handleStepError } from './error.js'

// Retrieve the return value of a step
export const getStepReturn = function ({
  event,
  packageName,
  newError,
  newEnvChanges,
  newStatus,
  coreStep,
  coreStepName: timerName = `${packageName} ${event}`,
  childEnv,
  mode,
  api,
  errorMonitor,
  deployId,
  netlifyConfig,
  configMutations,
  headersPath,
  redirectsPath,
  logs,
  debug,
  timers,
  durationNs,
  testOpts,
}) {
  if (newError !== undefined) {
    return handleStepError({
      event,
      newError,
      childEnv,
      mode,
      api,
      errorMonitor,
      deployId,
      coreStep,
      netlifyConfig,
      logs,
      debug,
      testOpts,
    })
  }

  logStepSuccess(logs)

  logTimer(logs, durationNs, timerName)

  return { newEnvChanges, netlifyConfig, configMutations, headersPath, redirectsPath, newStatus, timers }
}
