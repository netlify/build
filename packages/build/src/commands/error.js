const { cancelBuild } = require('../error/cancel')
const { handleBuildError } = require('../error/handle')
const { getFullErrorInfo } = require('../error/parse/parse')
const { serializeErrorStatus } = require('../error/parse/serialize_status')

const { isSoftFailEvent } = require('./get')

// Handle shell or plugin error:
//  - usually (`failFast`), propagate the error to make the build stop.
//  - if onError and onEnd events (not `failFast`), wait until all event
//    handlers of the same type have been triggered before propagating
//  - if `utils.build.failPlugin()` was used, print an error and skip next event
//    handlers of that plugin. But do not stop build.
const handleCommandError = async function({
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
}) {
  // `build.command` do not report error statuses
  if (buildCommand !== undefined) {
    return { newError }
  }

  const fullErrorInfo = getFullErrorInfo({ error: newError, colors: false, debug })
  const {
    type,
    errorInfo: { location: { package } = {} },
  } = fullErrorInfo
  const newStatus = serializeErrorStatus({ fullErrorInfo })

  if (type === 'failPlugin' || isSoftFailEvent(event)) {
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

  if (type === 'cancelBuild') {
    await cancelBuild({ api, deployId })
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
