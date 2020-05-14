const { env } = require('process')

const stripAnsi = require('strip-ansi')

const { serializeErrorStatus } = require('../error/parse/serialize_status')
const { logStatuses } = require('../log/main')

// The last event handler of a plugin (except for `onError` and `onEnd`)
// defaults to `utils.status.show({ state: 'success' })` without any `summary`.
const getSuccessStatus = function(newStatus, { commands, event, package }) {
  if (newStatus === undefined && isLastMainCommand({ commands, event, package })) {
    return IMPLICIT_STATUS
  }

  return newStatus
}

const isLastMainCommand = function({ commands, event, package }) {
  const mainCommands = commands.filter(command => command.package === package && isMainCommand(command))
  return mainCommands.length === 0 || mainCommands[mainCommands.length - 1].event === event
}

const isMainCommand = function({ event }) {
  return event !== 'onEnd' && event !== 'onError'
}

const IMPLICIT_STATUS = { state: 'success', implicit: true }

// Merge plugin status to the list of plugin statuses.
const addStatus = function({ newStatus, statuses, event, package, packageJson: { version } = {} }) {
  // Either:
  //  - `build.command`
  //  - no status was set
  if (newStatus === undefined) {
    return statuses
  }

  const formerStatus = statuses.find(status => status.package === package)
  if (!canOverrideStatus(formerStatus, newStatus)) {
    return statuses
  }

  // Overrides plugin's previous status and add more information
  const newStatuses = statuses.filter(status => status !== formerStatus)
  return [...newStatuses, { ...newStatus, event, package, version }]
}

const canOverrideStatus = function(formerStatus, newStatus) {
  // No previous status
  if (formerStatus === undefined) {
    return true
  }

  // Implicit statuses can never override
  if (newStatus.implicit) {
    return false
  }

  // Error statuses can only be overwritten by other error statuses
  return formerStatus.state === 'success' || newStatus.state !== 'success'
}

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

// Remove colors from statuses
const removeStatusesColors = function(statuses) {
  return statuses.map(removeStatusColors)
}

const removeStatusColors = function(status) {
  const attributes = COLOR_ATTRIBUTES.map(attribute => removeAttrColor(status, attribute))
  return Object.assign({}, status, ...attributes)
}

const COLOR_ATTRIBUTES = ['title', 'summary', 'text']

const removeAttrColor = function(status, attribute) {
  const value = status[attribute]
  if (value === undefined) {
    return {}
  }

  const valueA = stripAnsi(value)
  return { [attribute]: valueA }
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

module.exports = { getSuccessStatus, addStatus, reportPluginLoadError, reportStatuses }
