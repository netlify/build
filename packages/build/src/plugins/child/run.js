const { getNewEnvChanges, setEnvChanges } = require('../../env/changes.js')
const { setOldProperty } = require('../error')

const { getUtils } = require('./utils')

// Run a specific plugin event handler
const run = async function({ event, error, envChanges }, { pluginCommands, api, constants, inputs, netlifyConfig }) {
  const { method } = pluginCommands.find(pluginCommand => pluginCommand.event === event)
  const runState = {}
  const utils = getUtils({ constants, runState })
  const runOptions = { api, utils, constants, inputs, netlifyConfig, error }
  validateOldSyntax(runOptions)

  const envBefore = setEnvChanges(envChanges)
  await method(runOptions)
  const newEnvChanges = getNewEnvChanges(envBefore)
  return { ...runState, newEnvChanges }
}

// Backward compatibility warnings. Non-enumerable.
// TODO: remove once no plugins is doing this anymore.
const validateOldSyntax = function(runOptions) {
  setOldProperty(runOptions, 'pluginConfig', 'The "pluginConfig" argument has been renamed to "inputs"')
  setOldProperty(runOptions.constants, 'BUILD_DIR', 'The "BUILD_DIR" argument has been renamed to "PUBLISH_DIR"')
}

module.exports = { run }
