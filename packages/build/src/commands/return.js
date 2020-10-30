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
  buildCommand,
  childEnv,
  mode,
  api,
  errorMonitor,
  deployId,
  netlifyConfig,
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
      buildCommand,
      netlifyConfig,
      logs,
      debug,
      testOpts,
    })
  }

  logCommandSuccess(logs)

  const timerName = packageName === undefined ? 'build.command' : `${packageName} ${event}`
  logTimer(logs, durationNs, timerName)

  return { newEnvChanges, newStatus, timers }
}

module.exports = { getCommandReturn }
