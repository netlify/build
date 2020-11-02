'use strict'

const { handleBuildError } = require('../error/handle')
const { logStatuses } = require('../log/messages/status')

const { removeStatusesColors } = require('./colors')

// Report plugin statuses to the console and API
const reportStatuses = async function ({
  statuses,
  childEnv,
  api,
  mode,
  netlifyConfig,
  errorMonitor,
  deployId,
  logs,
  debug,
  sendStatus,
  testOpts,
}) {
  if (statuses === undefined) {
    return
  }

  const statusesA = removeStatusesColors(statuses)
  printStatuses({ statuses: statusesA, mode, logs })
  await sendApiStatuses({
    statuses: statusesA,
    childEnv,
    api,
    mode,
    netlifyConfig,
    errorMonitor,
    deployId,
    logs,
    debug,
    sendStatus,
    testOpts,
  })
}

// When not in production, print statuses to console.
// Only print successful ones, since errors are logged afterwards.
const printStatuses = function ({ statuses, mode, logs }) {
  if (mode === 'buildbot') {
    return
  }

  const successStatuses = statuses.filter(shouldPrintStatus)

  if (successStatuses.length === 0) {
    return
  }

  logStatuses(logs, successStatuses)
}

const shouldPrintStatus = function ({ state, summary }) {
  return state === 'success' && summary !== undefined
}

// In production, send statuses to the API
const sendApiStatuses = async function ({
  statuses,
  childEnv,
  api,
  mode,
  netlifyConfig,
  errorMonitor,
  deployId,
  logs,
  debug,
  sendStatus,
  testOpts,
}) {
  if ((mode !== 'buildbot' && !sendStatus) || api === undefined || !deployId) {
    return
  }

  await Promise.all(
    statuses.map((status) =>
      sendApiStatus({ api, status, childEnv, mode, netlifyConfig, errorMonitor, deployId, logs, debug, testOpts }),
    ),
  )
}

const sendApiStatus = async function ({
  api,
  status: { packageName, version, state, event, title, summary, text },
  childEnv,
  mode,
  netlifyConfig,
  errorMonitor,
  deployId,
  logs,
  debug,
  testOpts,
}) {
  try {
    await api.createPluginRun({
      deploy_id: deployId,
      body: { package: packageName, version, state, reporting_event: event, title, summary, text },
    })
    // Bitballoon API randomly fails with 502.
    // Builds should be successful when this API call fails, but we still want
    // to report the error both in logs and in error monitoring.
  } catch (error) {
    await handleBuildError(error, { errorMonitor, netlifyConfig, childEnv, mode, logs, debug, testOpts })
  }
}

module.exports = { reportStatuses }
