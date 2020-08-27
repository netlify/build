const { type, freemem, totalmem } = require('os')
const { promisify } = require('util')

const osName = require('os-name')

const { getEnvMetadata } = require('../../env/metadata')
const { log } = require('../../log/logger.js')
const { getErrorInfo } = require('../info')
const { getHomepage } = require('../parse/plugin')
const { getTypeInfo } = require('../type')

const { getLocationMetadata } = require('./location')
const { normalizeGroupingMessage } = require('./normalize')
const { printEventForTest } = require('./print')

// Report a build failure for monitoring purpose
const reportBuildError = async function({ error, errorMonitor, childEnv, logs, testOpts }) {
  if (errorMonitor === undefined) {
    return
  }

  const errorInfo = getErrorInfo(error)
  const { type, severity, title, group = title } = getTypeInfo(errorInfo)
  const severityA = getSeverity(severity, errorInfo)
  const groupA = getGroup(group, errorInfo)
  const groupingHash = getGroupingHash(groupA, error, type)
  const metadata = getMetadata(errorInfo, childEnv, groupingHash)
  const app = getApp()
  const eventProps = getEventProps({ severity: severityA, group: groupA, groupingHash, metadata, app })

  const errorName = updateErrorName(error, type)
  try {
    await reportError({ errorMonitor, error, logs, testOpts, eventProps })
  } finally {
    error.name = errorName
  }
}

// Plugin authors test their plugins as local plugins. Errors there are more
// like development errors, and should be reported as `info` only.
const getSeverity = function(severity, { location: { loadedFrom } = {} }) {
  if (loadedFrom === 'local') {
    return 'info'
  }

  return severity
}

const getGroup = function(group, errorInfo) {
  if (typeof group !== 'function') {
    return group
  }

  return group(errorInfo)
}

const getGroupingHash = function(group, error, type) {
  const message = error instanceof Error && typeof error.message === 'string' ? error.message : String(error)
  const messageA = normalizeGroupingMessage(message, type)
  return `${group}\n${messageA}`
}

const getMetadata = function({ location, plugin }, childEnv, groupingHash) {
  const pluginMetadata = getPluginMetadata({ location, plugin })
  const envMetadata = getEnvMetadata(childEnv)
  const locationMetadata = getLocationMetadata(location, envMetadata)
  return { location: locationMetadata, ...pluginMetadata, env: envMetadata, other: { groupingHash } }
}

const getPluginMetadata = function({ location, plugin }) {
  if (plugin === undefined) {
    return {}
  }

  const { pluginPackageJson, ...pluginA } = plugin
  const homepage = getHomepage(pluginPackageJson, location)
  return { plugin: { ...pluginA, homepage }, pluginPackageJson }
}

const getApp = function() {
  return {
    osName: type(),
    osVersion: osName(),
    freeMemory: freemem(),
    totalMemory: totalmem(),
  }
}

// `error.name` is shown proeminently in the Bugsnag UI. We need to update it to
// match error `type` since it is more granular and useful.
// But we change it back after Bugsnag is done reporting.
const updateErrorName = function(error, type) {
  const { name } = error
  error.name = type
  return name
}

const reportError = async function({ errorMonitor, error, logs, testOpts, eventProps }) {
  if (testOpts.errorMonitor) {
    printEventForTest(error, eventProps, logs)
    return
  }

  try {
    await promisify(errorMonitor.notify)(error, event => onError(event, eventProps))
    // Failsafe
  } catch (error) {
    log(logs, `Error monitor could not notify\n${error.stack}`)
    return
  }
}

const getEventProps = function({ severity, group, groupingHash, metadata, app }) {
  // `unhandled` is used to calculate Releases "stabiity score", which is
  // basically the percentage of unhandled errors. Since we handle all errors,
  // we need to implement this according to error types.
  const unhandled = severity === 'error'
  return { severity, context: group, groupingHash, _metadata: metadata, app, unhandled }
}

// Add more information to Bugsnag events
const onError = function(event, eventProps) {
  // Bugsnag client requires directly mutating the `event`
  // eslint-disable-next-line fp/no-mutating-assign
  Object.assign(event, {
    ...eventProps,
    unhandled: event.unhandled || eventProps.unhandled,
    _metadata: { ...event._metadata, ...eventProps._metadata },
    app: { ...event.app, ...eventProps.app },
  })
  return true
}

module.exports = { reportBuildError }
