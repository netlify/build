import pFilter from 'p-filter'

import { logDryRunStart, logDryRunStep, logDryRunEnd } from '../log/messages/dry.js'
import { runsOnlyOnBuildFailure } from '../plugins/events.js'

// If the `dry` flag is specified, do a dry run
export const doDryRun = async function ({ buildDir, steps, netlifyConfig, constants, buildbotServerSocket, logs }) {
  const successSteps = await pFilter(steps, ({ event, condition }) =>
    shouldIncludeStep({ buildDir, event, condition, netlifyConfig, constants, buildbotServerSocket }),
  )
  const eventWidth = Math.max(...successSteps.map(getEventLength))
  const stepsCount = successSteps.length

  logDryRunStart({ logs, eventWidth, stepsCount })

  successSteps.forEach((step, index) => {
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
}) {
  return (
    !runsOnlyOnBuildFailure(event) &&
    (condition === undefined || (await condition({ buildDir, constants, netlifyConfig, buildbotServerSocket })))
  )
}

const getEventLength = function ({ event }) {
  return event.length
}
