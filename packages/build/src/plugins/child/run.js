'use strict'

const { getNewEnvChanges, setEnvChanges } = require('../../env/changes')

const { cloneNetlifyConfig, getConfigMutations } = require('./diff')
const { getUtils } = require('./utils')

// Run a specific plugin event handler
const run = async function (
  { event, error, constants, envChanges, netlifyConfig },
  { pluginSteps, inputs, packageJson },
) {
  const { method } = pluginSteps.find((pluginStep) => pluginStep.event === event)
  const runState = {}
  const utils = getUtils({ event, constants, runState })
  const netlifyConfigCopy = cloneNetlifyConfig(netlifyConfig)
  const runOptions = { utils, constants, inputs, netlifyConfig: netlifyConfigCopy, packageJson, error }

  const envBefore = setEnvChanges(envChanges)
  await method(runOptions)
  const newEnvChanges = getNewEnvChanges(envBefore, netlifyConfig, netlifyConfigCopy)

  const configMutations = getConfigMutations(netlifyConfig, netlifyConfigCopy, event)
  return { ...runState, newEnvChanges, configMutations }
}

module.exports = { run }
