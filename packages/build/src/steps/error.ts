import type { ErrorParam } from '../core/types.js'
import { cancelBuild } from '../error/cancel.js'
import { handleBuildError } from '../error/handle.js'
import { getFullErrorInfo, parseErrorInfo } from '../error/parse/parse.js'
import { serializeErrorStatus } from '../error/parse/serialize_status.js'
import { BuildError, isPluginLocation, PluginLocation, ErrorTypes } from '../error/types.js'
import { isSoftFailEvent } from '../plugins/events.js'
import { addErrorToActiveSpan, addEventToActiveSpan } from '../tracing/main.js'

import { isTrustedPlugin } from './plugin.js'

/**
 * Handle build command errors and plugin errors:
 *  - usually, propagate the error to make the build stop.
 *  - `utils.build.cancelBuild()` also cancels the build by calling the API
 *  - `utils.build.failPlugin()` or post-deploy errors do not make the build
 *    stop, but are still reported, and prevent future events from the same
 *    plugin.
 * This also computes error statuses that are sent to the API.
 */
export const handleStepError = function ({
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
}) {
  addErrorToActiveSpan(newError)
  // Core steps do not report error statuses
  if (coreStep !== undefined) {
    return { newError }
  }

  const fullErrorInfo = getFullErrorInfo({ error: newError, colors: false, debug })
  const { errorInfo, message, title, type } = fullErrorInfo

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
    const cancellationAttributes = {
      'build.cancellation.title': title,
      'build.cancellation.message': message,
    }
    if (isPluginLocation(errorInfo.location)) {
      cancellationAttributes['build.cancellation.packageName'] = errorInfo.location.packageName
    }
    addEventToActiveSpan('build.cancelled', cancellationAttributes)
    return handleCancelBuild({ fullErrorInfo, newError, api, deployId })
  }

  return handleFailBuild({ fullErrorInfo, newError })
}

type failPluginArgs = {
  newError: Error
  fullErrorInfo: BuildError
} & ErrorParam

/* On `utils.build.failPlugin()` or during `onSuccess` or `onEnd` */
const handleFailPlugin = async function ({
  fullErrorInfo,
  newError,
  childEnv,
  mode,
  errorMonitor,
  netlifyConfig,
  logs,
  debug,
  testOpts,
}: failPluginArgs) {
  const newStatus = serializeErrorStatus({ fullErrorInfo, state: 'failed_plugin' })
  await handleBuildError(newError, { errorMonitor, netlifyConfig, childEnv, mode, logs, debug, testOpts })
  // TODO we should probably use type guard here, but due to the way we build these errorInfo objects I'm not 100%
  // confident we have all the properties currently required by the type
  const location = fullErrorInfo.errorInfo.location as PluginLocation
  return { failedPlugin: [location.packageName], newStatus }
}

/* On `utils.build.cancelBuild()` */
const handleCancelBuild = async function ({ fullErrorInfo, newError, api, deployId }) {
  const newStatus = serializeErrorStatus({ fullErrorInfo, state: 'canceled_build' })
  await cancelBuild({ api, deployId })
  return { newError, newStatus }
}

/* On `utils.build.failBuild()` or uncaught exception */
const handleFailBuild = function ({ fullErrorInfo, newError }) {
  const newStatus = serializeErrorStatus({ fullErrorInfo, state: 'failed_build' })
  return { newError, newStatus }
}

/* Unlike community plugins, core plugin and trusted plugin bugs should be handled as system errors */
export const getPluginErrorType = function (
  error: Error,
  loadedFrom: string,
  packageName?: string,
): { type?: ErrorTypes } {
  if (isTrustedPluginBug(error, packageName)) {
    return { type: 'trustedPlugin' }
  }
  if (!isCorePluginBug(error, loadedFrom)) {
    return {}
  }

  return { type: 'corePlugin' }
}

const isCorePluginBug = function (error: Error, loadedFrom: string) {
  const { severity } = parseErrorInfo(error)
  return severity === 'warning' && loadedFrom === 'core'
}

const isTrustedPluginBug = function (error: Error, packageName?: string) {
  const { severity } = parseErrorInfo(error)
  return severity === 'warning' && isTrustedPlugin(packageName)
}
