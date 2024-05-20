import { logTimer } from '../log/messages/core.js'

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
  outputGate,
  debug,
  timers,
  durationNs,
  testOpts,
  systemLog,
  quiet,
  metrics,
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

  if (!quiet) {
    logTimer(logs, durationNs, timerName, systemLog, outputGate)
  }

  return { newEnvChanges, netlifyConfig, configMutations, headersPath, redirectsPath, newStatus, timers, metrics }
}
