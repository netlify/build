import { getGlobalContext, setGlobalContext } from '@netlify/opentelemetry-utils'
import { context, propagation } from '@opentelemetry/api'

import { getNewEnvChanges, setEnvChanges } from '../../env/changes.js'
import { logPluginMethodEnd, logPluginMethodStart } from '../../log/messages/ipc.js'

import { cloneNetlifyConfig, getConfigMutations } from './diff.js'
import { getSystemLog } from './systemLog.js'
import { getUtils } from './utils.js'

/** Run a specific plugin event handler */
export const run = async function (
  { event, error, constants, envChanges, featureFlags, netlifyConfig, otelCarrier, extensionMetadata },
  { methods, inputs, packageJson, verbose },
) {
  setGlobalContext(propagation.extract(context.active(), otelCarrier))

  // set the global context for the plugin run
  return context.with(getGlobalContext(), async () => {
    const method = methods[event]
    const runState = {}
    const generatedFunctions = []
    const systemLog = getSystemLog()
    const utils = getUtils({ event, constants, generatedFunctions, runState })
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
    await method(runOptions)
    logPluginMethodEnd(verbose)

    const newEnvChanges = getNewEnvChanges(envBefore, netlifyConfig, netlifyConfigCopy)

    const configMutations = getConfigMutations(netlifyConfig, netlifyConfigCopy, event)
    const returnValue = generatedFunctions.length ? { generatedFunctions } : undefined
    return { ...runState, newEnvChanges, configMutations, returnValue }
  })
}
