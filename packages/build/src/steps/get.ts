import { getUtils } from '../plugins/child/utils.js'
import { DEV_EVENTS, EVENTS } from '../plugins/events.js'
import { uploadBlobs } from '../plugins_core/blobs_upload/index.js'
import { buildCommandCore } from '../plugins_core/build_command.js'
import { deploySite } from '../plugins_core/deploy/index.js'
import { devUploadBlobs } from '../plugins_core/dev_blobs_upload/index.js'
import { bundleEdgeFunctions } from '../plugins_core/edge_functions/index.js'
import { applyDeployConfig } from '../plugins_core/frameworks_api/index.js'
import { bundleFunctions } from '../plugins_core/functions/index.js'
import { dbSetup } from '../plugins_core/db_setup/index.js'
import { copyDbMigrations } from '../plugins_core/db_setup/migrations.js'
import { preCleanup } from '../plugins_core/pre_cleanup/index.js'
import { preDevCleanup } from '../plugins_core/pre_dev_cleanup/index.js'
import { saveArtifacts } from '../plugins_core/save_artifacts/index.js'
import { scanForSecrets } from '../plugins_core/secrets_scanning/index.js'
import { CoreStep, Event } from '../plugins_core/types.js'

// Get all build steps
export const getSteps = function (steps, eventHandlers?: any[]) {
  const stepsA = addCoreSteps(steps)
  const eventSteps = getEventSteps(eventHandlers)
  const stepsB = [...stepsA, ...eventSteps]

  const stepsC = sortSteps(stepsB, EVENTS)
  const events = getEvents(stepsB)
  return { steps: stepsC, events }
}

export const getDevSteps = function (command, steps, eventHandlers: any[]) {
  const devCommandStep = {
    event: 'onDev',
    coreStep: async (args) => {
      const { constants, event } = args
      const utils = getUtils({ event, constants, runState: {}, deployEnvVars: args.deployEnvVars })
      await command({ utils, ...args })

      return {}
    },
    coreStepId: 'dev_command',
    coreStepName: 'dev.command',
    coreStepDescription: () => 'Run command for local development',
  }

  const eventSteps = getEventSteps(eventHandlers)

  const sortedSteps = sortSteps([preDevCleanup, ...steps, devUploadBlobs, eventSteps, devCommandStep], DEV_EVENTS)
  const events = getEvents(sortedSteps)

  return { steps: sortedSteps, events }
}

const getEventSteps = function (eventHandlers?: any[]) {
  return Object.entries(eventHandlers ?? {}).map(([event, eventHandler]) => {
    let description = `Event handler for ${event}`
    let handler = eventHandler

    if (typeof eventHandler !== 'function') {
      description = eventHandler.description
      handler = eventHandler.handler
    }

    return {
      event: event as Event,
      coreStep: (args) => {
        const { constants, event } = args
        const utils = getUtils({ event, constants, runState: {}, deployEnvVars: args.deployEnvVars })

        return handler({ utils, ...args })
      },
      coreStepId: `options_${event}`,
      coreStepName: `options.${event}`,
      coreStepDescription: () => description,
      quiet: eventHandler.quiet,
    }
  })
}

const addCoreSteps = function (steps): CoreStep[] {
  return [
    preCleanup,
    dbSetup,
    buildCommandCore,
    applyDeployConfig,
    ...steps,
    bundleFunctions,
    bundleEdgeFunctions,
    copyDbMigrations,
    scanForSecrets,
    uploadBlobs,
    deploySite,
    saveArtifacts,
  ]
}

// Sort plugin steps by event order.
const sortSteps = function (steps: CoreStep[], events: string[]) {
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
