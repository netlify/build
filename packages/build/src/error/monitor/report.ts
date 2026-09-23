import { type as osType, freemem, totalmem } from 'os'
import { promisify } from 'util'

import type { Client, Event, OnErrorCallback } from '@bugsnag/js'
import osName from 'os-name'

import type { TestOptions } from '../../core/types.js'
import { getEnvMetadata } from '../../env/metadata.js'
import { log, type Logs } from '../../log/logger.js'
import { parseErrorInfo } from '../parse/parse.js'
import { getHomepage } from '../parse/plugin.js'
import {
  hasErrorLocation,
  type AnyErrorLocation,
  type BasicErrorInfo,
  type ErrorInfo,
  type ErrorTypes,
} from '../types.js'

import { getLocationMetadata } from './location.js'
import { normalizeGroupingMessage } from './normalize.js'
import { printEventForTest } from './print.js'

// Report a build failure for monitoring purpose
export const reportBuildError = async function ({
  error,
  errorMonitor,
  childEnv,
  logs,
  testOpts,
}: {
  error: unknown
  errorMonitor: Client | undefined
  childEnv: NodeJS.ProcessEnv | undefined
  logs: Logs | undefined
  testOpts: TestOptions | undefined
}) {
  if (errorMonitor === undefined) {
    return
  }

  const { errorInfo, type, severity, title, group = title } = parseErrorInfo(error)
  const severityA = getSeverity(severity, errorInfo)
  const groupA = getGroup(group, errorInfo)
  const groupingHash = getGroupingHash(groupA, error, type, errorInfo)
  const metadata = getMetadata(errorInfo, childEnv, groupingHash)
  const app = getApp()
  const eventProps = getEventProps({ severity: severityA, group: groupA, groupingHash, metadata, app })

  // Any thrown value is reported: Bugsnag accepts non-`Error` ones, and reading `name` throws on `null` or `undefined`
  const reportedError = error as Error
  const errorName = updateErrorName(reportedError, type)
  try {
    await reportError({ errorMonitor, error: reportedError, logs, testOpts, eventProps })
  } finally {
    try {
      // Setting error values might fail if they are getters or are non-writable.
      reportedError.name = errorName
    } catch {
      // continue
    }
  }
}

// Plugin authors test their plugins as local plugins. Errors there are more
// like development errors, and should be reported as `info` only.
const getSeverity = function (
  severity: BasicErrorInfo['severity'],
  { location: { loadedFrom } = {} }: { location?: AnyErrorLocation },
) {
  if (loadedFrom === 'local' || severity === 'none') {
    return 'info'
  }

  return severity
}

const getGroup = function (
  group: NonNullable<BasicErrorInfo['group']> | BasicErrorInfo['title'],
  errorInfo: ErrorInfo,
) {
  if (typeof group !== 'function') {
    return group
  }

  if (!hasErrorLocation(errorInfo)) {
    // Known bug kept: group functions crashed on a missing location (V8's message named the property)
    throw new TypeError('Cannot read properties of undefined')
  }

  return group(errorInfo)
}

const getGroupingHash = function (
  group: string | undefined,
  error: unknown,
  type: ErrorTypes,
  errorInfo: ErrorInfo = {},
) {
  // If the error has a `normalizedMessage`, we use it as the grouping hash.
  if (errorInfo.normalizedMessage) {
    return errorInfo.normalizedMessage
  }

  const message = error instanceof Error && typeof error.message === 'string' ? error.message : String(error)
  const messageA = normalizeGroupingMessage(message, type)
  return `${String(group)}\n${messageA}`
}

const getMetadata = function (
  { location, plugin, tsConfig }: ErrorInfo,
  childEnv: NodeJS.ProcessEnv | undefined,
  groupingHash: string,
) {
  const pluginMetadata = getPluginMetadata({ location, plugin })
  const envMetadata = getEnvMetadata(childEnv)
  const locationMetadata = getLocationMetadata(location, envMetadata)
  return { location: locationMetadata, ...pluginMetadata, tsConfig, env: envMetadata, other: { groupingHash } }
}

const getPluginMetadata = function ({
  location,
  plugin,
}: {
  location: AnyErrorLocation | undefined
  plugin: ErrorInfo['plugin']
}) {
  if (plugin === undefined) {
    return {}
  }

  const { pluginPackageJson, ...pluginA } = plugin
  // `normalize-package-data` turns `bugs` and `repository` into objects, and `getHomepage()` reads `loadedFrom` only
  const homepage = getHomepage(pluginPackageJson as Parameters<typeof getHomepage>[0], location)
  return { plugin: { ...pluginA, homepage }, pluginPackageJson }
}

const getApp = function () {
  return {
    osName: osType(),
    osVersion: osName(),
    freeMemory: freemem(),
    totalMemory: totalmem(),
  }
}

// `error.name` is shown proeminently in the Bugsnag UI. We need to update it to
// match error `type` since it is more granular and useful.
// But we change it back after Bugsnag is done reporting.
const updateErrorName = function (error: Error, type: ErrorTypes) {
  const { name } = error
  // This might fail if `name` is a getter or is non-writable.
  try {
    error.name = type
  } catch {
    // continue regardless error
  }
  return name
}

const reportError = async function ({
  errorMonitor,
  error,
  logs,
  testOpts,
  eventProps,
}: {
  errorMonitor: Client
  error: Error
  logs: Logs | undefined
  testOpts: TestOptions | undefined
  eventProps: EventProps
}) {
  if (testOpts === undefined) {
    // Same crash as before: `runCoreSteps()` does not pass `testOpts`
    throw new TypeError("Cannot read properties of undefined (reading 'errorMonitor')")
  }

  if (testOpts.errorMonitor) {
    printEventForTest(error, eventProps, logs)
    return
  }

  try {
    // No-op bind for unbound-method: Bugsnag already binds `notify()` to its client
    await promisify<Error, OnErrorCallback, Event>(errorMonitor.notify.bind(errorMonitor))(error, (event) =>
      onError(event, eventProps),
    )
    // Failsafe
  } catch {
    log(logs, `Error monitor could not notify\n${String(error.stack)}`)
  }
}

type EventProps = ReturnType<typeof getEventProps>

const getEventProps = function ({
  severity,
  group,
  groupingHash,
  metadata,
  app,
}: {
  severity: string
  group: string | undefined
  groupingHash: string
  metadata: ReturnType<typeof getMetadata>
  app: ReturnType<typeof getApp>
}) {
  // `unhandled` is used to calculate Releases "stabiity score", which is
  // basically the percentage of unhandled errors. Since we handle all errors,
  // we need to implement this according to error types.
  const unhandled = severity === 'error'
  return { severity, context: group, groupingHash, _metadata: metadata, app, unhandled }
}

// Add more information to Bugsnag events
const onError = function (event: Event, eventProps: EventProps) {
  // Bugsnag client requires directly mutating the `event`
  Object.assign(event, {
    ...eventProps,
    unhandled: event.unhandled || eventProps.unhandled,

    // `Event` does not declare `_metadata`, which Bugsnag sets on every event
    _metadata: { ...(event as Event & { _metadata: object })._metadata, ...eventProps._metadata },
    app: { ...event.app, ...eventProps.app },
  })
  return true
}
