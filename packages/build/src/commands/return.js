const { logCommandSuccess } = require('../log/main')
const { logTimer } = require('../log/main')

const { handleCommandError } = require('./error')

// Retrieve the return value of a build command or plugin event handler
const getCommandReturn = function({
  event,
  package,
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
  featureFlags,
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
      featureFlags,
    })
  }

  logCommandSuccess(logs)

  const timerName = package === undefined ? 'build.command' : `${package} ${event}`
  logTimer(logs, durationNs, timerName)

  return { newEnvChanges, newStatus, timers }
}

module.exports = { getCommandReturn }
