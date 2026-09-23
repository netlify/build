import { runsOnlyOnBuildFailure } from '../plugins/events.js'

import type { Status } from './add.js'

type StepsInfo = {
  steps: readonly { event: string; packageName?: string | undefined }[]
  event: string
  packageName: string
}

// The last event handler of a plugin (except for `onError` and `onEnd`)
// defaults to `utils.status.show({ state: 'success' })` without any `summary`.
export const getSuccessStatus = function (
  newStatus: Status | undefined,
  { steps, event, packageName }: StepsInfo,
): Status | undefined {
  if (newStatus === undefined && isLastNonErrorStep({ steps, event, packageName })) {
    return IMPLICIT_STATUS
  }

  return newStatus
}

const isLastNonErrorStep = function ({ steps, event, packageName }: StepsInfo) {
  const nonErrorSteps = steps.filter((step) => step.packageName === packageName && !runsOnlyOnBuildFailure(step.event))
  return nonErrorSteps.length === 0 || nonErrorSteps.at(-1)?.event === event
}

const IMPLICIT_STATUS: Status = { state: 'success', implicit: true }
