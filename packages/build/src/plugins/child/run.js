const { getNewEnvChanges, setEnvChanges } = require('../../env/changes.js')

const { getUtils } = require('./utils')

// Run a specific plugin event handler
const run = async function(
  { event, error, envChanges },
  { pluginCommands, api, utilsData, constants, inputs, netlifyConfig },
) {
  const { method } = pluginCommands.find(pluginCommand => pluginCommand.event === event)
  const runState = {}
  const utils = getUtils({ utilsData, constants, runState })
  const runOptions = { api, utils, constants, inputs, netlifyConfig, error }
  addBackwardCompatibility(runOptions)

  const envBefore = setEnvChanges(envChanges)
  await method(runOptions)
  const newEnvChanges = getNewEnvChanges(envBefore)
  return { ...runState, newEnvChanges }
}

// Add older names, kept for backward compatibility. Non-enumerable.
// TODO: remove after being out of beta
const addBackwardCompatibility = function(runOptions) {
  Object.defineProperties(runOptions, {
    pluginConfig: { value: runOptions.inputs },
  })
  // Make `constants.BUILD_DIR` non-enumerable
  Object.defineProperty(runOptions.constants, 'BUILD_DIR', {
    value: runOptions.constants.BUILD_DIR,
  })
}

module.exports = { run }
