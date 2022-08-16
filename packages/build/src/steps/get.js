import { DEV_EVENTS, EVENTS } from '../plugins/events.js'
import { buildCommandCore } from '../plugins_core/build_command.js'
import { deploySite } from '../plugins_core/deploy/index.js'
import { bundleEdgeFunctions } from '../plugins_core/edge_functions/index.js'
import { bundleFunctions } from '../plugins_core/functions/index.js'

// Get all build steps
export const getSteps = function (steps) {
  const stepsA = addCoreSteps(steps)
  const stepsB = sortSteps(stepsA, EVENTS)
  const events = getEvents(stepsB)
  return { steps: stepsB, events }
}

// Get all dev steps
export const getDevSteps = function (command, steps) {
  const devCommandStep = {
    event: 'onDev',
    coreStep: async () => {
      await command()

      return {}
    },
    coreStepId: 'dev_command',
    coreStepName: 'dev.command',
    coreStepDescription: () => 'Run command for local development',
  }
  const sortedSteps = sortSteps([...steps, devCommandStep], DEV_EVENTS)
  const events = getEvents(sortedSteps)

  return { steps: sortedSteps, events }
}

const addCoreSteps = function (steps) {
  return [buildCommandCore, ...steps, bundleFunctions, bundleEdgeFunctions, deploySite]
}

// Sort plugin steps by event order.
const sortSteps = function (steps, events) {
  return events.flatMap((event) => steps.filter((step) => step.event === event))
}

// Retrieve list of unique events
const getEvents = function (steps) {
  const events = steps.map(getEvent)
  return [...new Set(events)]
}

const getEvent = function ({ event }) {
  return event
}
