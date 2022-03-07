// Merge plugin status to the list of plugin statuses.
export const addStatus = function ({ newStatus, statuses, event, packageName, pluginPackageJson: { version } = {} }) {
  // Either:
  //  - `build.command`
  //  - no status was set
  if (newStatus === undefined) {
    return statuses
  }

  const formerStatus = statuses.find((status) => status.packageName === packageName)
  if (!canOverrideStatus(formerStatus, newStatus)) {
    return statuses
  }

  // Overrides plugin's previous status and add more information
  const newStatuses = statuses.filter((status) => status !== formerStatus)
  return [...newStatuses, { ...newStatus, event, packageName, version }]
}

const canOverrideStatus = function (formerStatus, newStatus) {
  // No previous status
  if (formerStatus === undefined) {
    return true
  }

  // Implicit statuses can never override
  if (newStatus.implicit) {
    return false
  }

  // Error statuses can only be overwritten by more severe error statuses
  return STATES.indexOf(formerStatus.state) <= STATES.indexOf(newStatus.state)
}

// Possible status states, ordered by severity.
const STATES = ['success', 'canceled_plugin', 'failed_plugin', 'failed_build']
