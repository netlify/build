const { logStatuses } = require('../log/main')

// Assign default value for successful `newStatus`
// Retrieved from `utils.status.show()`, which is optional
const getSuccessStatus = function({ status, statuses, package }) {
  // `utils.status.show()` called in the current event
  if (status !== undefined) {
    return status
  }

  // `utils.status.show()` not called, but set in a previous event
  const hasStatus = statuses.some(pluginStatus => pluginStatus.package === package)
  if (hasStatus) {
    return
  }

  // `utils.status.show()` not called, but this is the first event, so we assign a default
  return { state: 'success' }
}

// Merge `success` status to the list of plugin statuses.
const addStatus = function({ newStatus, statuses, event, package, packageJson: { version } = {} }) {
  // Either:
  //  - `build.command`
  //  - `utils.status.show()` not called but set in a previous event
  if (newStatus === undefined) {
    return statuses
  }

  // Error statuses cannot be overwritten
  const formerStatus = statuses.find(status => status.package === package)
  if (formerStatus !== undefined && formerStatus.state !== 'success') {
    return statuses
  }

  // Overrides plugin's previous status and add more information
  const newStatuses = statuses.filter(status => status !== formerStatus)
  return [...newStatuses, { ...newStatus, event, package, version }]
}

const reportStatuses = async function(statuses, api, mode) {
  printStatuses(statuses, mode)
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

module.exports = { getSuccessStatus, addStatus, reportStatuses }
