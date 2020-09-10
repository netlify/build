const { isErrorEvent } = require('../commands/get')
const { addErrorInfo } = require('../error/info')
const { getFullErrorInfo } = require('../error/parse/parse')
const { serializeErrorStatus } = require('../error/parse/serialize_status')

// The last event handler of a plugin (except for `onError` and `onEnd`)
// defaults to `utils.status.show({ state: 'success' })` without any `summary`.
const getSuccessStatus = function(newStatus, { commands, event, package }) {
  if (newStatus === undefined && isLastNonErrorCommand({ commands, event, package })) {
    return IMPLICIT_STATUS
  }

  return newStatus
}

const isLastNonErrorCommand = function({ commands, event, package }) {
  const nonErrorCommands = commands.filter(command => command.package === package && !isErrorEvent(command.event))
  return nonErrorCommands.length === 0 || nonErrorCommands[nonErrorCommands.length - 1].event === event
}

const IMPLICIT_STATUS = { state: 'success', implicit: true }

// Merge plugin status to the list of plugin statuses.
const addStatus = function({ newStatus, statuses, event, package, pluginPackageJson: { version } = {} }) {
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
const addPluginLoadErrorStatus = function({ error, package, version, debug }) {
  const fullErrorInfo = getFullErrorInfo({ error, colors: false, debug })
  const errorStatus = serializeErrorStatus({ fullErrorInfo })
  const statuses = [{ ...errorStatus, event: 'load', package, version }]
  addErrorInfo(error, { statuses })
  return error
}

module.exports = { getSuccessStatus, addStatus, addPluginLoadErrorStatus }
