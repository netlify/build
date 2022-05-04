import { EVENTS } from '../plugins/events.js'
import { buildCommandCore } from '../plugins_core/build_command.js'
import { deploySite } from '../plugins_core/deploy/index.js'
import { bundleEdgeFunctions } from '../plugins_core/edge_functions/index.js'
import { bundleFunctions } from '../plugins_core/functions/index.js'

// Get all build steps
export const getSteps = function (steps) {
  const stepsA = addCoreSteps(steps)
  const stepsB = sortSteps(stepsA)
  const events = getEvents(stepsB)
  return { steps: stepsB, events }
}

const addCoreSteps = function (steps) {
  return [buildCommandCore, ...steps, bundleFunctions, bundleEdgeFunctions, deploySite]
}

// Sort plugin steps by event order.
const sortSteps = function (steps) {
  return EVENTS.flatMap((event) => steps.filter((step) => step.event === event))
}

// Retrieve list of unique events
const getEvents = function (steps) {
  const events = steps.map(getEvent)
  return [...new Set(events)]
}

const getEvent = function ({ event }) {
  return event
}
