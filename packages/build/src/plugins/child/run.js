const { getNewEnvChanges, setEnvChanges } = require('../../env/changes.js')

const { getUtils } = require('./utils')

// Run a specific plugin event handler
const run = async function(
  { event, error, envChanges, loadedFrom },
  { pluginCommands, constants, inputs, netlifyConfig, featureFlags },
) {
  const { method } = pluginCommands.find(pluginCommand => pluginCommand.event === event)
  const runState = {}
  const utils = getUtils({ event, constants, runState, featureFlags })
  const runOptions = { utils, constants, inputs, netlifyConfig, error }

  const runOptionsA = cleanRunOptions({ loadedFrom, runOptions })

  const envBefore = setEnvChanges(envChanges)
  await method(runOptionsA)
  const newEnvChanges = getNewEnvChanges(envBefore)
  return { ...runState, newEnvChanges }
}

// Remove any runOptions that is only intended for core plugins
const cleanRunOptions = function({
  loadedFrom,
  runOptions: {
    constants: { BUILDBOT_SERVER_SOCKET, ...constants },
    ...runOptions
  },
}) {
  if (loadedFrom !== 'core') {
    return { ...runOptions, constants }
  }

  return { ...runOptions, constants: { ...constants, BUILDBOT_SERVER_SOCKET } }
}

module.exports = { run }
