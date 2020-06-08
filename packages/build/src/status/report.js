const { reportBuildError } = require('../error/monitor/report')
const { serializeErrorStatus } = require('../error/parse/serialize_status')
const { logStatuses, logBuildError } = require('../log/main')

const { removeStatusesColors } = require('./colors')

// Errors that happen during plugin loads should be reported as error statuses
const reportPluginLoadError = async function({
  error,
  api,
  mode,
  event,
  package,
  version,
  netlifyConfig,
  errorMonitor,
  deployId,
  logs,
  testOpts,
}) {
  const errorStatus = serializeErrorStatus(error)
  const statuses = [{ ...errorStatus, event, package, version }]
  await reportStatuses({ statuses, api, mode, netlifyConfig, errorMonitor, deployId, logs, testOpts })
}

const reportStatuses = async function({ statuses, api, mode, netlifyConfig, errorMonitor, deployId, logs, testOpts }) {
  const statusesA = removeStatusesColors(statuses)
  printStatuses({ statuses: statusesA, mode, logs })
  await sendStatuses({ statuses: statusesA, api, mode, netlifyConfig, errorMonitor, deployId, logs, testOpts })
}

// When not in production, print statuses to console.
// Only print successful ones, since errors are logged afterwards.
const printStatuses = function({ statuses, mode, logs }) {
  if (mode === 'buildbot') {
    return
  }

  const successStatuses = statuses.filter(shouldPrintStatus)

  if (successStatuses.length === 0) {
    return
  }

  logStatuses(logs, successStatuses)
}

const shouldPrintStatus = function({ state, summary }) {
  return state === 'success' && summary !== undefined
}

// In production, send statuses to the API
const sendStatuses = async function({ statuses, api, mode, netlifyConfig, errorMonitor, deployId, logs, testOpts }) {
  if ((mode !== 'buildbot' && !testOpts.sendStatus) || api === undefined || !deployId) {
    return
  }

  await Promise.all(
    statuses.map(status => sendStatus({ api, status, netlifyConfig, errorMonitor, deployId, logs, testOpts })),
  )
}

const sendStatus = async function({
  api,
  status: { package, version, state, event, title, summary, text },
  netlifyConfig,
  errorMonitor,
  deployId,
  logs,
  testOpts,
}) {
  try {
    await api.createPluginRun({
      deploy_id: deployId,
      body: { package, version, state, reporting_event: event, title, summary, text },
    })
    // Bitballoon API randomly fails with 502.
    // Builds should be successful when this API call fails, but we still want
    // to report the error both in logs and in error monitoring.
  } catch (error) {
    logBuildError({ error, netlifyConfig, logs })
    await reportBuildError({ error, errorMonitor, logs, testOpts })
  }
}

module.exports = { reportPluginLoadError, reportStatuses }
