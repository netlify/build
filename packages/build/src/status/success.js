import { runsOnlyOnBuildFailure } from '../plugins/events.js'

// The last event handler of a plugin (except for `onError` and `onEnd`)
// defaults to `utils.status.show({ state: 'success' })` without any `summary`.
export const getSuccessStatus = function (newStatus, { steps, event, packageName }) {
  if (newStatus === undefined && isLastNonErrorStep({ steps, event, packageName })) {
    return IMPLICIT_STATUS
  }

  return newStatus
}

const isLastNonErrorStep = function ({ steps, event, packageName }) {
  const nonErrorSteps = steps.filter((step) => step.packageName === packageName && !runsOnlyOnBuildFailure(step.event))
  return nonErrorSteps.length === 0 || nonErrorSteps[nonErrorSteps.length - 1].event === event
}

const IMPLICIT_STATUS = { state: 'success', implicit: true }
