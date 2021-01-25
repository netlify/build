'use strict'

const { getEnvBefore, getNewEnvChanges } = require('../../env/changes.js')

const { getUtils } = require('./utils')

// Run a specific plugin event handler
const run = async function ({ event, error, constants }, { pluginCommands, inputs, netlifyConfig, packageJson }) {
  const { method } = pluginCommands.find((pluginCommand) => pluginCommand.event === event)
  const runState = {}
  const utils = getUtils({ event, constants, runState })
  const runOptions = { utils, constants, inputs, netlifyConfig, packageJson, error }

  const envBefore = getEnvBefore()
  await method(runOptions)
  const newEnvChanges = getNewEnvChanges(envBefore)
  return { ...runState, newEnvChanges }
}

module.exports = { run }
