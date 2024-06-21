import pFilter from 'p-filter'

import { logDryRunStart, logDryRunStep, logDryRunEnd } from '../log/messages/dry.js'
import { runsOnlyOnBuildFailure } from '../plugins/events.js'

// If the `dry` flag is specified, do a dry run
export const doDryRun = async function ({
  buildDir,
  steps,
  netlifyConfig,
  constants,
  buildbotServerSocket,
  logs,
  featureFlags,
}) {
  const successSteps = await pFilter(steps, ({ event, condition }) =>
    shouldIncludeStep({ buildDir, event, condition, netlifyConfig, constants, buildbotServerSocket, featureFlags }),
  )
  const eventWidth = Math.max(...successSteps.map(getEventLength))
  const stepsCount = successSteps.length

  logDryRunStart({ logs, eventWidth, stepsCount })

  successSteps
    .filter((step) => !step.quiet)
    .forEach((step, index) => {
      logDryRunStep({ logs, step, index, netlifyConfig, eventWidth, stepsCount })
    })

  logDryRunEnd(logs)
}

const shouldIncludeStep = async function ({
  buildDir,
  event,
  condition,
  netlifyConfig,
  constants,
  buildbotServerSocket,
  featureFlags,
}) {
  return (
    !runsOnlyOnBuildFailure(event) &&
    (condition === undefined ||
      (await condition({ buildDir, constants, netlifyConfig, buildbotServerSocket, featureFlags })))
  )
}

const getEventLength = function ({ event }) {
  return event.length
}
