import type { NetlifyAPI } from '@netlify/api'

import type { ErrorParam } from '../core/types.js'
import { handleBuildError } from '../error/handle.js'
import { logStatuses } from '../log/messages/status.js'

import type { PluginStatus } from './add.js'
import { removeStatusesColors } from './colors.js'

type PluginRunBody = {
  package: string
  version: string | undefined
  state: PluginStatus['state']
  reporting_event: string | undefined
  title: string | undefined
  summary: string | undefined
  text: string | undefined
  extra_data: unknown
}

declare module '@netlify/api' {
  interface NetlifyAPI {
    // Generated at runtime from the OpenAPI spec, but left out of its types since it is internal-only
    createPluginRun: (params: { deploy_id: string; body: PluginRunBody }) => Promise<unknown>
  }
}

// Plugins that did not complete only have a `packageName` and a `skipped` state
type ReportedStatus = Pick<PluginStatus, 'packageName' | 'state' | 'title' | 'summary' | 'text' | 'extraData'> & {
  event?: string | undefined
  version?: string | undefined
}

type SendStatusArgs = ErrorParam & {
  api?: NetlifyAPI | undefined
  deployId?: string | undefined
  sendStatus?: boolean | undefined
}

// Report plugin statuses to the console and API
// Error parameters are forwarded with rest properties, since `ErrorParam` does not accept explicit `undefined` values
export const reportStatuses = async function ({
  statuses,
  pluginsOptions,
  ...params
}: SendStatusArgs & {
  statuses?: PluginStatus[] | undefined
  pluginsOptions: readonly { packageName: string }[]
}) {
  const finalStatuses = getFinalStatuses({ statuses, pluginsOptions })
  if (finalStatuses.length === 0) {
    return
  }

  const statusesA = removeStatusesColors(finalStatuses)
  printStatuses({ statuses: statusesA, mode: params.mode, logs: params.logs })
  await sendApiStatuses({ statuses: statusesA, ...params })
}

// Some plugins might not have completed due to a build error.
// In that case, we add a dummy plugin run with state "skipped".
// This allows the API to know both plugins that have completed and only started
const getFinalStatuses = function ({
  statuses = [],
  pluginsOptions,
}: {
  statuses: PluginStatus[] | undefined
  pluginsOptions: readonly { packageName: string }[]
}): ReportedStatus[] {
  return pluginsOptions.map(({ packageName }) => getPluginStatus(packageName, statuses))
}

const getPluginStatus = function (packageName: string, statuses: PluginStatus[]): ReportedStatus {
  const pluginStatus = statuses.find((status) => status.packageName === packageName)

  if (pluginStatus !== undefined) {
    return pluginStatus
  }

  return { packageName, state: 'skipped' }
}

// When not in production, print statuses to console.
// Only print successful ones, since errors are logged afterwards.
const printStatuses = function ({
  statuses,
  mode,
  logs,
}: {
  statuses: ReportedStatus[]
  mode: ErrorParam['mode']
  logs: ErrorParam['logs']
}) {
  if (mode === 'buildbot') {
    return
  }

  const successStatuses = statuses.filter(shouldPrintStatus)

  if (successStatuses.length === 0) {
    return
  }

  logStatuses(logs, successStatuses)
}

const shouldPrintStatus = function (status: ReportedStatus): status is ReportedStatus & { summary: string } {
  return status.state === 'success' && status.summary !== undefined
}

// In production, send statuses to the API
const sendApiStatuses = async function ({
  statuses,
  api,
  deployId,
  sendStatus,
  ...errorParams
}: SendStatusArgs & { statuses: ReportedStatus[] }) {
  if ((errorParams.mode !== 'buildbot' && !sendStatus) || api === undefined || !deployId) {
    return
  }

  await Promise.all(statuses.map((status) => sendApiStatus({ api, status, deployId, ...errorParams })))
}

const sendApiStatus = async function ({
  api,
  status: { packageName, version, state, event, title, summary, text, extraData },
  deployId,
  ...errorParams
}: ErrorParam & { api: NetlifyAPI; status: ReportedStatus; deployId: string }) {
  try {
    await api.createPluginRun({
      deploy_id: deployId,
      body: {
        package: packageName,
        version,
        state,
        reporting_event: event,
        title,
        summary,
        text,
        extra_data: extraData,
      },
    })
    // Bitballoon API randomly fails with 502.
    // Builds should be successful when this API call fails, but we still want
    // to report the error both in logs and in error monitoring.
  } catch (error) {
    await handleBuildError(error, errorParams)
  }
}
