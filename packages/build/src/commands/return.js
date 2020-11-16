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
  coreCommandName,
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
      coreCommand,
      buildCommand,
      netlifyConfig,
      logs,
      debug,
      testOpts,
    })
  }

  logCommandSuccess(logs)

  const timerName = getTimerName({ coreCommandName, buildCommand, packageName, event })
  logTimer(logs, durationNs, timerName)

  return { newEnvChanges, newStatus, timers }
}

const getTimerName = function ({ coreCommandName, buildCommand, packageName, event }) {
  if (coreCommandName !== undefined) {
    return coreCommandName
  }

  if (buildCommand !== undefined) {
    return 'build.command'
  }

  return `${packageName} ${event}`
}

module.exports = { getCommandReturn }
