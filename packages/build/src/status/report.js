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
  pluginsOptions,
  netlifyConfig,
  errorMonitor,
  deployId,
  logs,
  debug,
  sendStatus,
  testOpts,
}) {
  const finalStatuses = getFinalStatuses({ statuses, pluginsOptions })
  if (finalStatuses.length === 0) {
    return
  }

  const statusesA = removeStatusesColors(finalStatuses)
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

// Some plugins might not have completed due to a build error.
// In that case, we add a dummy plugin run with state "skipped".
// This allows the API to know both plugins that have completed and only started
const getFinalStatuses = function ({ statuses = [], pluginsOptions }) {
  return pluginsOptions.map(({ packageName }) => getPluginStatus(packageName, statuses))
}

const getPluginStatus = function (packageName, statuses) {
  const pluginStatus = statuses.find((status) => status.packageName === packageName)

  if (pluginStatus !== undefined) {
    return pluginStatus
  }

  return { packageName, state: 'skipped' }
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
