'use strict'

const { logTimer } = require('../log/messages/core')
const { logStepSuccess } = require('../log/messages/steps')

const { handleStepError } = require('./error')

// Retrieve the return value of a step
const getStepReturn = function ({
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

module.exports = { getStepReturn }
