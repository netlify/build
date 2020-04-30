const { type, freemem, totalmem } = require('os')
const { env } = require('process')
const { promisify } = require('util')

const osName = require('os-name')

const { log } = require('../../log/logger.js')
const { getErrorInfo } = require('../info')
const { getTypeInfo } = require('../type')

const { normalizeGroupingMessage } = require('./normalize')
const { printEventForTest } = require('./print')

// Report a build failure for monitoring purpose
const reportBuildError = async function(error, errorMonitor) {
  if (errorMonitor === undefined) {
    return
  }

  const { type, severity, context } = getTypeInfo(error)
  const errorInfo = getErrorInfo(error)
  const severityA = getSeverity(severity, errorInfo)
  const contextA = getContext(context, errorInfo)
  const groupingHash = getGroupingHash(contextA, error, type)
  const metadata = getMetadata(errorInfo)
  const app = getApp()

  const errorName = updateErrorName(error, type)
  try {
    await reportError({ errorMonitor, error, severity: severityA, context: contextA, groupingHash, metadata, app })
  } finally {
    error.name = errorName
  }
}

// Plugin authors test their plugins as local plugins. Errors there are more
// like development errors, and should be reported as `info` only.
const getSeverity = function(severity, { location: { local } = {} }) {
  if (local) {
    return 'info'
  }

  return severity
}

const getContext = function(context, errorInfo) {
  if (typeof context !== 'function') {
    return context
  }

  return context(errorInfo)
}

const getGroupingHash = function(context, error, type) {
  const message = error instanceof Error ? error.message : String(error)
  const messageA = normalizeGroupingMessage(message, type)
  return `${context}\n${messageA}`
}

const getMetadata = function({ location, plugin }) {
  return { location, plugin }
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

const reportError = async function({ errorMonitor, error, severity, context, groupingHash, metadata, app }) {
  try {
    await promisify(errorMonitor.notify)(error, event =>
      onError({ event, severity, context, groupingHash, metadata, app }),
    )
    // Failsafe
  } catch (error) {
    log(`Error monitor could not notify\n${error.stack}`)
    return
  }
}

// Add more information to Bugsnag events
const onError = function({ event, severity, context, groupingHash, metadata, app }) {
  // `unhandled` is used to calculate Releases "stabiity score", which is
  // basically the percentage of unhandled errors. Since we handle all errors,
  // we need to implement this according to error types.
  const unhandled = event.unhandled || severity === 'error'

  Object.assign(event, {
    severity,
    context,
    groupingHash,
    _metadata: { ...event._metadata, ...metadata },
    app: { ...event.app, ...app },
    unhandled,
  })

  if (env.NETLIFY_BUILD_TEST === '1') {
    printEventForTest(event)
    return false
  }

  return true
}

module.exports = { reportBuildError }
