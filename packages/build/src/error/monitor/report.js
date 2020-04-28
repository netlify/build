const { type, freemem, totalmem } = require('os')
const { env } = require('process')
const { promisify } = require('util')

const osName = require('os-name')

const { log } = require('../../log/logger.js')
const { getErrorInfo } = require('../info')
const { getTypeInfo } = require('../type')

const { printEventForTest } = require('./print')

// Report a build failure for monitoring purpose
const reportBuildError = async function(error, errorMonitor) {
  if (errorMonitor === undefined) {
    return
  }

  const { severity, context } = getTypeInfo(error)
  const errorInfo = getErrorInfo(error)
  const contextA = getContext(context, errorInfo)
  const groupingHash = getGroupingHash(contextA, error)
  const metadata = getMetadata(errorInfo)
  const app = getApp()

  await reportError({ errorMonitor, error, severity, context: contextA, groupingHash, metadata, app })
}

const getContext = function(context, errorInfo) {
  if (typeof context !== 'function') {
    return context
  }

  return context(errorInfo)
}

const getGroupingHash = function(context, error) {
  const message = error instanceof Error ? error.message : String(error)
  return `${context}\n${message}`
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
  Object.assign(event, {
    severity,
    context,
    groupingHash,
    _metadata: { ...event._metadata, ...metadata },
    app: { ...event.app, ...app },
  })

  if (env.NETLIFY_BUILD_TEST === '1') {
    printEventForTest(event)
    return false
  }

  return true
}

module.exports = { reportBuildError }
