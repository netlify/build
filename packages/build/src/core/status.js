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

  // Overrides plugin's previous status and add more information
  const newStatuses = statuses.filter(status => status.package !== package)
  return [...newStatuses, { ...newStatus, event, package, version }]
}

module.exports = { getSuccessStatus, addStatus }
