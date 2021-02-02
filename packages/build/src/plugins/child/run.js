'use strict'

const { getNewEnvChanges, setEnvChanges } = require('../../env/changes.js')

const { getUtils } = require('./utils')

// Run a specific plugin event handler
const run = async function (
  { event, error, constants, envChanges },
  { pluginCommands, inputs, netlifyConfig, packageJson },
) {
  const { method } = pluginCommands.find((pluginCommand) => pluginCommand.event === event)
  const runState = {}
  const utils = getUtils({ event, constants, runState })
  const runOptions = { utils, constants, inputs, netlifyConfig, packageJson, error }

  const envBefore = setEnvChanges(envChanges)
  await method(runOptions)
  const newEnvChanges = getNewEnvChanges(envBefore)
  return { ...runState, newEnvChanges }
}

module.exports = { run }
