import { DEV_EVENTS, EVENTS } from '../plugins/events.js'
import { buildCommandCore } from '../plugins_core/build_command.js'
import { deploySite } from '../plugins_core/deploy/index.js'
import { bundleEdgeFunctions } from '../plugins_core/edge_functions/index.js'
import { bundleFunctions } from '../plugins_core/functions/index.js'
import { saveArtifacts } from '../plugins_core/save_artifacts/index.js'
import { scanForSecrets } from '../plugins_core/secrets_scanning/index.js'

// Get all build steps
export const getSteps = function (steps, eventHandlers) {
  const stepsA = addCoreSteps(steps)
  const eventSteps = getEventSteps(eventHandlers)
  const stepsB = [...stepsA, ...eventSteps]

  const stepsC = sortSteps(stepsB, EVENTS)
  const events = getEvents(stepsB)
  return { steps: stepsC, events }
}

// Get all dev steps
export const getDevSteps = function (command, steps, eventHandlers) {
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

  const eventSteps = getEventSteps(eventHandlers)

  const sortedSteps = sortSteps([...steps, eventSteps, devCommandStep], DEV_EVENTS)
  const events = getEvents(sortedSteps)

  return { steps: sortedSteps, events }
}

const getEventSteps = function (eventHandlers) {
  return Object.entries(eventHandlers ?? {}).map(([event, eventHandler]) => {
    if (typeof eventHandler !== 'function') {
      const { handler, description } = eventHandler

      return {
        event,
        coreStep: handler,
        coreStepId: `options_${event}`,
        coreStepName: `options.${event}`,
        coreStepDescription: () => description,
      }
    } else {
      return {
        event,
        coreStep: eventHandler,
        coreStepId: `options_${event}`,
        coreStepName: `options.${event}`,
        coreStepDescription: () => `Custom event handler for ${event}`,
      }
    }
  })
}

const addCoreSteps = function (steps) {
  return [buildCommandCore, ...steps, bundleFunctions, bundleEdgeFunctions, scanForSecrets, deploySite, saveArtifacts]
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
