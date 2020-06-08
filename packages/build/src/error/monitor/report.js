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
const reportBuildError = async function({ error, errorMonitor, logs, testOpts }) {
  if (errorMonitor === undefined) {
    return
  }

  const errorInfo = getErrorInfo(error)
  const { type, severity, title, group = title } = getTypeInfo(errorInfo)
  const severityA = getSeverity(severity, errorInfo)
  const groupA = getGroup(group, errorInfo)
  const groupingHash = getGroupingHash(groupA, error, type)
  const metadata = getMetadata(errorInfo, groupingHash)
  const app = getApp()

  const errorName = updateErrorName(error, type)
  try {
    await reportError({
      errorMonitor,
      error,
      severity: severityA,
      group: groupA,
      groupingHash,
      metadata,
      app,
      logs,
      testOpts,
    })
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

const getMetadata = function({ location, plugin, childEnv }, groupingHash) {
  const pluginMetadata = getPluginMetadata(plugin)
  const envMetadata = getEnvMetadata(childEnv)
  const locationMetadata = getLocationMetadata(location, envMetadata)
  return { location: locationMetadata, ...pluginMetadata, env: envMetadata, other: { groupingHash } }
}

const getPluginMetadata = function(plugin) {
  if (plugin === undefined) {
    return {}
  }

  const { packageJson, ...pluginA } = plugin
  const homepage = getHomepage(packageJson)
  return { plugin: { ...pluginA, homepage }, packageJson }
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

const reportError = async function({
  errorMonitor,
  error,
  severity,
  group,
  groupingHash,
  metadata,
  app,
  logs,
  testOpts,
}) {
  try {
    await promisify(errorMonitor.notify)(error, event =>
      onError({ event, severity, group, groupingHash, metadata, app, logs, testOpts }),
    )
    // Failsafe
  } catch (error) {
    log(logs, `Error monitor could not notify\n${error.stack}`)
    return
  }
}

// Add more information to Bugsnag events
const onError = function({ event, severity, group, groupingHash, metadata, app, logs, testOpts }) {
  // `unhandled` is used to calculate Releases "stabiity score", which is
  // basically the percentage of unhandled errors. Since we handle all errors,
  // we need to implement this according to error types.
  const unhandled = event.unhandled || severity === 'error'

  Object.assign(event, {
    severity,
    context: group,
    groupingHash,
    _metadata: { ...event._metadata, ...metadata },
    app: { ...event.app, ...app },
    unhandled,
  })

  if (testOpts.errorMonitor) {
    printEventForTest(event, logs)
    return false
  }

  return true
}

module.exports = { reportBuildError }
