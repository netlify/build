const { EVENTS } = require('../plugins/events')

// Get commands for all events
const getCommands = function(pluginsCommands, netlifyConfig) {
  const commands = sortCommands(addBuiltInCommands(pluginsCommands, netlifyConfig))
  const commandsCount = commands.filter(isSuccessCommand).length
  return { commands, commandsCount }
}

const addBuiltInCommands = function(pluginsCommands, netlifyConfig) {
  return addBuildCommand(addDeployCommand(pluginsCommands), netlifyConfig)
}

// Merge `build.command` with plugin event handlers
const addBuildCommand = function(
  pluginsCommands,
  { build: { command: buildCommand, commandOrigin: buildCommandOrigin } },
) {
  if (buildCommand === undefined) {
    return pluginsCommands
  }

  return [{ event: 'onBuild', buildCommand, buildCommandOrigin }, ...pluginsCommands]
}

// Schedule the deploy command as the first 'onDeploy' action
const addDeployCommand = function(pluginsCommands) {
  return [{ event: 'onDeploy', isDeploySiteCommand: true }, ...pluginsCommands]
}

// Sort plugin commands by event order.
const sortCommands = function(commands) {
  return EVENTS.flatMap(event => commands.filter(command => command.event === event))
}

const isDeployEvent = function(event) {
  return event === 'onDeploy'
}

const isDeployCommand = function({ event, isDeploySiteCommand }) {
  return isDeploySiteCommand || isDeployEvent(event)
}

const isMainCommand = function(command) {
  const { event } = command
  return event !== 'onEnd' && event !== 'onError' && !isDeployCommand(command)
}

const isEndCommand = function({ event }) {
  return event === 'onEnd'
}

const isErrorCommand = function({ event }) {
  return event === 'onError'
}

const isSuccessCommand = function({ event }) {
  return isMainCommand({ event }) || isEndCommand({ event })
}

module.exports = { getCommands, isMainCommand, isErrorCommand, isSuccessCommand, isDeployCommand }
