'use strict'

const { logCommandSuccess } = require('../log/messages/commands')
const { logTimer } = require('../log/messages/core')

const { handleCommandError } = require('./error')

// Retrieve the return value of a build command or plugin event handler
const getCommandReturn = function ({
  event,
  packageName,
  newError,
  newEnvChanges,
  newStatus,
  coreCommand,
  coreCommandName: timerName = `${packageName} ${event}`,
  childEnv,
  mode,
  api,
  errorMonitor,
  deployId,
  netlifyConfig,
  priorityConfig,
  logs,
  debug,
  timers,
  durationNs,
  testOpts,
}) {
  if (newError !== undefined) {
    return handleCommandError({
      event,
      newError,
      childEnv,
      mode,
      api,
      errorMonitor,
      deployId,
      coreCommand,
      netlifyConfig,
      logs,
      debug,
      testOpts,
    })
  }

  logCommandSuccess(logs)

  logTimer(logs, durationNs, timerName)

  return { newEnvChanges, netlifyConfig, priorityConfig, newStatus, timers }
}

module.exports = { getCommandReturn }
