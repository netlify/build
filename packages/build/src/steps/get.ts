import type { DevCommand } from '../core/dev.js'
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
import { applySpaFallback } from '../plugins_core/spa_fallback/index.js'
import type { CoreStepFunctionArgs } from '../plugins_core/types.js'
import type { NetlifyPlugin } from '../types/netlify_plugin.js'

type Step = { event: string }

type PluginStep = Step & { packageName: string }

// Unlike what `BuildFlags['eventHandlers']` declares, handlers get the core step arguments, not the plugin ones
type EventHandler = DevCommand

type EventHandlers = {
  [Event in keyof NetlifyPlugin]?:
    | (EventHandler & { quiet?: boolean })
    | { handler: EventHandler; description: string; quiet?: boolean }
}

// Get all build steps
export const getSteps = function <LoadedPluginStep extends PluginStep>(
  steps: readonly LoadedPluginStep[],
  eventHandlers?: EventHandlers,
) {
  const stepsA = addCoreSteps(steps)
  const eventSteps = getEventSteps(eventHandlers)
  const stepsB = [...stepsA, ...eventSteps]

  const stepsC = sortSteps(stepsB, EVENTS)
  const events = getEvents(stepsB)
  return { steps: stepsC, events }
}

export const getDevSteps = function <LoadedPluginStep extends PluginStep>(
  command: DevCommand,
  steps: readonly LoadedPluginStep[],
  eventHandlers?: EventHandlers,
) {
  const devCommandStep = {
    event: 'onDev',
    coreStep: async (args: CoreStepFunctionArgs) => {
      const { constants } = args
      const utils = getUtils({ event: NO_EVENT, constants, runState: {}, deployEnvVars: args.deployEnvVars })
      await command({ utils, ...args })

      return {}
    },
    coreStepId: 'dev_command',
    coreStepName: 'dev.command',
    coreStepDescription: () => 'Run command for local development',
  }

  const eventSteps = getEventSteps(eventHandlers)

  // `eventSteps` is not spread, so `sortSteps()` drops it and event handlers never run in dev
  const sortedSteps = sortSteps([preDevCleanup, ...steps, devUploadBlobs, eventSteps, devCommandStep], DEV_EVENTS)
  const events = getEvents(sortedSteps)

  return { steps: sortedSteps, events }
}

// Core steps are not passed their `event`, and `getUtils()` treats a missing one like this non-soft-fail one
const NO_EVENT = ''

const getEventSteps = function (eventHandlers?: EventHandlers) {
  return Object.entries(eventHandlers ?? {}).map(([event, eventHandler]) => {
    const description = typeof eventHandler === 'function' ? `Event handler for ${event}` : eventHandler.description
    const handler = typeof eventHandler === 'function' ? eventHandler : eventHandler.handler

    return {
      event,
      coreStep: (args: CoreStepFunctionArgs) => {
        const { constants } = args
        const utils = getUtils({ event: NO_EVENT, constants, runState: {}, deployEnvVars: args.deployEnvVars })

        return handler({ utils, ...args })
      },
      coreStepId: `options_${event}`,
      coreStepName: `options.${event}`,
      coreStepDescription: () => description,
      quiet: eventHandler.quiet,
    }
  })
}

const addCoreSteps = function <LoadedPluginStep extends PluginStep>(steps: readonly LoadedPluginStep[]) {
  return [
    preCleanup,
    dbSetup,
    buildCommandCore,
    applyDeployConfig,
    ...steps,
    bundleFunctions,
    bundleEdgeFunctions,
    copyDbMigrations,
    applySpaFallback,
    scanForSecrets,
    uploadBlobs,
    deploySite,
    saveArtifacts,
  ]
}

// Sort plugin steps by event order.
const sortSteps = function <MaybeStep extends object>(steps: readonly MaybeStep[], events: readonly string[]) {
  return events.flatMap((event) =>
    steps.filter((step): step is Extract<MaybeStep, Step> => 'event' in step && step.event === event),
  )
}

// Retrieve list of unique events
const getEvents = function (steps: readonly Step[]) {
  const events = steps.map(getEvent)
  return [...new Set(events)]
}

const getEvent = function ({ event }: Step) {
  return event
}
