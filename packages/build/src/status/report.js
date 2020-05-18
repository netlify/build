const { env } = require('process')

const { serializeErrorStatus } = require('../error/parse/serialize_status')
const { logStatuses } = require('../log/main')

const { removeStatusesColors } = require('./colors')

// Errors that happen during plugin loads should be reported as error statuses
const reportPluginLoadError = async function({ error, api, mode, event, package, version }) {
  const errorStatus = serializeErrorStatus(error)
  const statuses = [{ ...errorStatus, event, package, version }]
  await reportStatuses(statuses, api, mode)
}

const reportStatuses = async function(statuses, api, mode) {
  const statusesA = removeStatusesColors(statuses)
  printStatuses(statusesA, mode)
  await sendStatuses(statusesA, api, mode)
}

// When not in production, print statuses to console.
// Only print successful ones, since errors are logged afterwards.
const printStatuses = function(statuses, mode) {
  if (mode === 'buildbot') {
    return
  }

  const successStatuses = statuses.filter(shouldPrintStatus)

  if (successStatuses.length === 0) {
    return
  }

  logStatuses(successStatuses)
}

const shouldPrintStatus = function({ state, summary }) {
  return state === 'success' && summary !== undefined
}

// In production, send statuses to the API
const sendStatuses = async function(statuses, api, mode) {
  if ((mode !== 'buildbot' && env.NETLIFY_BUILD_TEST_STATUS !== '1') || api === undefined || !env.DEPLOY_ID) {
    return
  }

  await Promise.all(statuses.map(status => sendStatus(api, status)))
}

const sendStatus = async function(api, { package, version, state, event, title, summary, text }) {
  await api.createPluginRun({
    deploy_id: env.DEPLOY_ID,
    body: { package, version, state, reporting_event: event, title, summary, text },
  })
}

module.exports = { reportPluginLoadError, reportStatuses }
