'use strict'

const { getNewEnvChanges, setEnvChanges } = require('../../env/changes')

const { trackConfigMutations } = require('./track')
const { getUtils } = require('./utils')

// Run a specific plugin event handler
const run = async function (
  { event, error, constants, envChanges, netlifyConfig },
  { pluginCommands, inputs, packageJson },
) {
  const { method } = pluginCommands.find((pluginCommand) => pluginCommand.event === event)
  const runState = {}
  const utils = getUtils({ event, constants, runState })
  const configMutations = []
  const netlifyConfigProxy = trackConfigMutations(netlifyConfig, configMutations, event)
  const runOptions = { utils, constants, inputs, netlifyConfig: netlifyConfigProxy, packageJson, error }

  const envBefore = setEnvChanges(envChanges)
  await method(runOptions)
  const newEnvChanges = getNewEnvChanges(envBefore)

  return { ...runState, newEnvChanges, configMutations }
}

module.exports = { run }
