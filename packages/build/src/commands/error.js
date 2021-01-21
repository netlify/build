'use strict'

const { cancelBuild } = require('../error/cancel')
const { handleBuildError } = require('../error/handle')
const { getFullErrorInfo, parseErrorInfo } = require('../error/parse/parse')
const { serializeErrorStatus } = require('../error/parse/serialize_status')
const { isSoftFailEvent } = require('../plugins/events')

// Handle build command errors and plugin errors:
//  - usually, propagate the error to make the build stop.
//  - `utils.build.cancelBuild()` also cancels the build by calling the API
//  - `utils.build.failPlugin()` or post-deploy errors do not make the build
//    stop, but are still reported, and prevent future events from the same
//    plugin.
// This also computes error statuses that are sent to the API.
const handleCommandError = function ({
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
}) {
  if (!shouldReportStatus({ buildCommand, coreCommand })) {
    return { newError }
  }

  const fullErrorInfo = getFullErrorInfo({ error: newError, colors: false, debug })
  const { type } = fullErrorInfo

  if (type === 'failPlugin' || isSoftFailEvent(event)) {
    return handleFailPlugin({
      fullErrorInfo,
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
    return handleCancelBuild({ fullErrorInfo, newError, api, deployId })
  }

  return handleFailBuild({ fullErrorInfo, newError })
}

// `build.command` and core commands do not report error statuses
const shouldReportStatus = function ({ buildCommand, coreCommand }) {
  return buildCommand === undefined && coreCommand === undefined
}

// On `utils.build.failPlugin()` or during `onSuccess` or `onEnd`
const handleFailPlugin = async function ({
  fullErrorInfo,
  fullErrorInfo: {
    errorInfo: { location: { packageName } = {} },
  },
  newError,
  childEnv,
  mode,
  errorMonitor,
  netlifyConfig,
  logs,
  debug,
  testOpts,
}) {
  const newStatus = serializeErrorStatus({ fullErrorInfo, state: 'failed_plugin' })
  await handleBuildError(newError, { errorMonitor, netlifyConfig, childEnv, mode, logs, debug, testOpts })
  return { failedPlugin: [packageName], newStatus }
}

// On `utils.build.cancelBuild()`
const handleCancelBuild = async function ({ fullErrorInfo, newError, api, deployId }) {
  const newStatus = serializeErrorStatus({ fullErrorInfo, state: 'canceled_build' })
  await cancelBuild({ api, deployId })
  return { newError, newStatus }
}

// On `utils.build.failBuild()` or uncaught exception
const handleFailBuild = function ({ fullErrorInfo, newError }) {
  const newStatus = serializeErrorStatus({ fullErrorInfo, state: 'failed_build' })
  return { newError, newStatus }
}

// Unlike community plugins, core plugin bugs should be handled as system errors
const getPluginErrorType = function (error, loadedFrom) {
  if (!isCorePluginBug(error, loadedFrom)) {
    return {}
  }

  return { type: 'corePlugin' }
}

const isCorePluginBug = function (error, loadedFrom) {
  const { severity } = parseErrorInfo(error)
  return severity === 'warning' && loadedFrom === 'core'
}

module.exports = { handleCommandError, getPluginErrorType }
