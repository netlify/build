import type { Logs } from '../log/logger.js'
import { logDryRunStart, logDryRunStep, logDryRunEnd } from '../log/messages/dry.js'
import type { StepDescriptionSource } from '../log/messages/steps.js'
import { runsOnlyOnBuildFailure } from '../plugins/events.js'
import type { NetlifyConfig } from '../types/config/netlify_config.js'

import type { NetlifyPluginConstants } from './constants.js'
import type { FeatureFlags } from './feature_flags.js'

type DryRunConditionArgs = {
  buildDir: string
  constants: NetlifyPluginConstants
  netlifyConfig: NetlifyConfig
  buildbotServerSocket?: string | undefined
  featureFlags: FeatureFlags
}

type DryRunStep = StepDescriptionSource & {
  event: string
  quiet?: boolean | undefined
  // Method syntax (bivariant) accepts core steps' `CoreStepCondition`; conditions reading other args
  // (e.g. `deployId`, `packagePath`) get `undefined` in dry runs
  condition?(args: DryRunConditionArgs): boolean | Promise<boolean>
}

// If the `dry` flag is specified, do a dry run
export const doDryRun = async function ({
  buildDir,
  steps,
  netlifyConfig,
  constants,
  buildbotServerSocket,
  logs,
  featureFlags,
}: DryRunConditionArgs & { steps: readonly DryRunStep[]; logs: Logs | undefined }) {
  const includedSteps = await Promise.all(
    steps.map(async (step) => {
      const shouldInclude = await shouldIncludeStep({
        buildDir,
        step,
        netlifyConfig,
        constants,
        buildbotServerSocket,
        featureFlags,
      })
      return shouldInclude ? step : null
    }),
  )
  const successSteps = includedSteps.filter((step) => step !== null)
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
  step,
  netlifyConfig,
  constants,
  buildbotServerSocket,
  featureFlags,
}: DryRunConditionArgs & { step: DryRunStep }) {
  return (
    !runsOnlyOnBuildFailure(step.event) &&
    (step.condition === undefined ||
      (await step.condition({ buildDir, constants, netlifyConfig, buildbotServerSocket, featureFlags })))
  )
}

const getEventLength = function ({ event }: DryRunStep) {
  return event.length
}
