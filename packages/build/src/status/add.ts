export type StatusState =
  | 'success'
  | 'canceled_plugin'
  | 'failed_plugin'
  | 'failed_build'
  | 'canceled_build'
  | 'skipped'

export interface Status {
  state: StatusState
  title?: string | undefined
  summary?: string | undefined
  text?: string | undefined
  extraData?: unknown
  implicit?: boolean
}

export type PluginStatus = Status & { event: string; packageName: string; version: string | undefined }

// Merge plugin status to the list of plugin statuses.
export const addStatus = function ({
  newStatus,
  statuses,
  event,
  packageName,
  pluginPackageJson: { version } = {},
}: {
  newStatus: Status | undefined
  statuses: PluginStatus[]
  event: string
  packageName: string
  pluginPackageJson?: { version?: string | undefined } | undefined
}): PluginStatus[] {
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

const canOverrideStatus = function (formerStatus: PluginStatus | undefined, newStatus: Status) {
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
const STATES: StatusState[] = ['success', 'canceled_plugin', 'failed_plugin', 'failed_build']
