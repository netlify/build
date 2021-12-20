import { getNewEnvChanges, setEnvChanges } from '../../env/changes.js'
import { logPluginMethodStart, logPluginMethodEnd } from '../../log/messages/ipc.js'

import { cloneNetlifyConfig, getConfigMutations } from './diff.js'
import { getUtils } from './utils.js'

// Run a specific plugin event handler
export const run = async function (
  { event, error, constants, envChanges, netlifyConfig },
  { methods, inputs, packageJson, verbose },
) {
  const method = methods[event]
  const runState = {}
  const utils = getUtils({ event, constants, runState })
  const netlifyConfigCopy = cloneNetlifyConfig(netlifyConfig)
  const runOptions = { utils, constants, inputs, netlifyConfig: netlifyConfigCopy, packageJson, error }

  const envBefore = setEnvChanges(envChanges)

  logPluginMethodStart(verbose)
  await method(runOptions)
  logPluginMethodEnd(verbose)

  const newEnvChanges = getNewEnvChanges(envBefore, netlifyConfig, netlifyConfigCopy)

  const configMutations = getConfigMutations(netlifyConfig, netlifyConfigCopy, event)
  return { ...runState, newEnvChanges, configMutations }
}
