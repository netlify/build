import type { Client } from '@bugsnag/js'
import type { NetlifyAPI } from '@netlify/api'
import { addEventToActiveSpan } from '@netlify/opentelemetry-utils'
import type { Attributes } from '@opentelemetry/api'

import type { Mode, TestOptions } from '../core/types.js'
import { cancelBuild } from '../error/cancel.js'
import { handleBuildError } from '../error/handle.js'
import { getFullErrorInfo, parseErrorInfo } from '../error/parse/parse.js'
import { serializeErrorStatus } from '../error/parse/serialize_status.js'
import { type BuildError, isPluginLocation, type PluginLocation, type ErrorTypes } from '../error/types.js'
import type { Logs } from '../log/logger.js'
import { isSoftFailEvent } from '../plugins/events.js'
import { isTrustedPlugin } from '../plugins/trusted.js'
import type { CoreStepFunction } from '../plugins_core/types.js'
import { addBuildErrorToActiveSpan } from '../tracing/main.js'
import type { NetlifyConfig } from '../types/config/netlify_config.js'

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
}: {
  event: string
  newError: unknown
  childEnv: NodeJS.ProcessEnv
  mode: Mode
  api: NetlifyAPI | undefined
  errorMonitor: Client | undefined
  deployId: string | undefined
  coreStep: CoreStepFunction | undefined
  netlifyConfig: NetlifyConfig
  logs: Logs | undefined
  debug: boolean
  testOpts: TestOptions
}) {
  // Steps return what they caught, which is untyped but in practice an `Error`
  addBuildErrorToActiveSpan(newError as Error)
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
    const cancellationAttributes: Attributes = {
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

type FailPluginArgs = {
  newError: unknown
  fullErrorInfo: BuildError
} & Parameters<typeof handleBuildError>[1]

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
}: FailPluginArgs) {
  const newStatus = serializeErrorStatus({ fullErrorInfo, state: 'failed_plugin' })
  await handleBuildError(newError, { errorMonitor, netlifyConfig, childEnv, mode, logs, debug, testOpts })
  // Core steps return early, and `firePluginStep()` always adds a plugin location
  const location = fullErrorInfo.errorInfo.location as PluginLocation
  return { failedPlugin: [location.packageName], newStatus }
}

/* On `utils.build.cancelBuild()` */
const handleCancelBuild = async function ({
  fullErrorInfo,
  newError,
  api,
  deployId,
}: {
  fullErrorInfo: BuildError
  newError: unknown
  api: NetlifyAPI | undefined
  deployId: string | undefined
}) {
  const newStatus = serializeErrorStatus({ fullErrorInfo, state: 'canceled_build' })
  await cancelBuild({ api, deployId })
  return { newError, newStatus }
}

/* On `utils.build.failBuild()` or uncaught exception */
const handleFailBuild = function ({ fullErrorInfo, newError }: { fullErrorInfo: BuildError; newError: unknown }) {
  const newStatus = serializeErrorStatus({ fullErrorInfo, state: 'failed_build' })
  return { newError, newStatus }
}

/* Unlike community plugins, core plugin and trusted plugin bugs should be handled as system errors */
export const getPluginErrorType = function (
  error: unknown,
  loadedFrom: string | undefined,
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

const isCorePluginBug = function (error: unknown, loadedFrom: string | undefined) {
  const { severity } = parseErrorInfo(error)
  return severity === 'warning' && loadedFrom === 'core'
}

const isTrustedPluginBug = function (error: unknown, packageName?: string) {
  const { severity } = parseErrorInfo(error)
  return severity === 'warning' && isTrustedPlugin(packageName)
}
