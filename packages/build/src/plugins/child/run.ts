import { getGlobalContext, setGlobalContext } from '@netlify/opentelemetry-utils'
import { context, propagation } from '@opentelemetry/api'

import type { NetlifyPluginConstants } from '../../core/constants.js'
import type { FeatureFlags } from '../../core/feature_flags.js'
import { getNewEnvChanges, setEnvChanges, type EnvChanges } from '../../env/changes.js'
import { logPluginMethodEnd, logPluginMethodStart } from '../../log/messages/ipc.js'
import type { ReturnValue } from '../../steps/return_values.js'
import type { NetlifyConfig } from '../../types/config/netlify_config.js'

import { cloneNetlifyConfig, getConfigMutations } from './diff.js'
import type { PluginContext } from './load.js'
import type { RunState } from './status.js'
import { getSystemLog } from './systemLog.js'
import { getUtils, type DeployEnvVarsData } from './utils.js'

export type RunPayload = {
  event: string
  error?: Error | undefined
  constants: NetlifyPluginConstants
  envChanges: EnvChanges
  featureFlags: FeatureFlags | undefined
  netlifyConfig: NetlifyConfig
  otelCarrier: Record<string, string>
  extensionMetadata: unknown
}

/** Run a specific plugin event handler */
export const run = async function (
  { event, error, constants, envChanges, featureFlags, netlifyConfig, otelCarrier, extensionMetadata }: RunPayload,
  { methods, inputs, packageJson, verbose }: PluginContext,
) {
  setGlobalContext(propagation.extract(context.active(), otelCarrier))

  // set the global context for the plugin run
  return context.with(getGlobalContext(), async () => {
    const method = methods[event]
    const runState: RunState = {}
    const generatedFunctions: NonNullable<ReturnValue['generatedFunctions']> = []
    const deployEnvVars: DeployEnvVarsData = []
    const systemLog = getSystemLog()
    const utils = getUtils({ event, constants, deployEnvVars, generatedFunctions, runState })
    const netlifyConfigCopy = cloneNetlifyConfig(netlifyConfig)
    const runOptions = {
      utils,
      constants,
      inputs,
      netlifyConfig: netlifyConfigCopy,
      packageJson,
      error,
      featureFlags,
      systemLog,
      extensionMetadata,
    }

    const envBefore = setEnvChanges(envChanges)

    logPluginMethodStart(verbose)
    // The parent only runs events returned by `load()`, so this has always been unreachable
    if (method === undefined) {
      throw new TypeError('method is not a function')
    }
    await method(runOptions)
    logPluginMethodEnd(verbose)

    const newEnvChanges = getNewEnvChanges(envBefore, netlifyConfig, netlifyConfigCopy)

    const configMutations = getConfigMutations(netlifyConfig, netlifyConfigCopy, event)
    const returnValue = generatedFunctions.length ? { generatedFunctions } : undefined
    return { ...runState, deployEnvVars, newEnvChanges, configMutations, returnValue }
  })
}
