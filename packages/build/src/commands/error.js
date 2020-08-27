const { cancelBuild } = require('../error/cancel')
const { handleBuildError } = require('../error/handle')
const { getErrorInfo } = require('../error/info')
const { serializeErrorStatus } = require('../error/parse/serialize_status')

// Handle shell or plugin error:
//  - usually (`failFast`), propagate the error to make the build stop.
//  - if onError and onEnd events (not `failFast`), wait until all event
//    handlers of the same type have been triggered before propagating
//  - if `utils.build.failPlugin()` was used, print an error and skip next event
//    handlers of that plugin. But do not stop build.
const handleCommandError = async function({
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
}) {
  // `build.command` do not report error statuses
  if (buildCommand !== undefined) {
    return { newError }
  }

  const { type, location: { package } = {} } = getErrorInfo(newError)
  const newStatus = serializeErrorStatus(newError, { debug })

  if (type === 'cancelBuild') {
    await cancelBuild({ api, deployId })
  }

  if (type === 'failPlugin') {
    return handleFailPlugin({
      newStatus,
      package,
      newError,
      childEnv,
      mode,
      errorMonitor,
      netlifyConfig,
      logs,
      debug,
      testOpts,
    })
  }

  return { newError, newStatus }
}

const handleFailPlugin = async function({
  newStatus,
  package,
  newError,
  childEnv,
  mode,
  errorMonitor,
  netlifyConfig,
  logs,
  debug,
  testOpts,
}) {
  await handleBuildError(newError, { errorMonitor, netlifyConfig, childEnv, mode, logs, debug, testOpts })
  return { failedPlugin: [package], newStatus }
}

module.exports = { handleCommandError }
