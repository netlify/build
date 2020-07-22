const { EVENTS } = require('../plugins/events')

// Get commands for all events
const getCommands = function(pluginsCommands, netlifyConfig, shouldAddDeployCommand) {
  const commands = addBuiltInCommands(pluginsCommands, netlifyConfig, shouldAddDeployCommand)
  const commandsA = sortCommands(commands)
  const commandsCount = commandsA.filter(isSuccessCommand).length
  return { commands: commandsA, commandsCount }
}

const addBuiltInCommands = function(pluginsCommands, netlifyConfig, shouldAddDeployCommand) {
  return addBuildCommand(shouldAddDeployCommand ? addDeployCommand(pluginsCommands) : pluginsCommands, netlifyConfig)
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

// Schedule the deploy command as the first 'onPostDeploy' action
const addDeployCommand = function(pluginsCommands) {
  return [{ event: 'onPostDeploy', isDeploySiteCommand: true }, ...pluginsCommands]
}

// Sort plugin commands by event order.
const sortCommands = function(commands) {
  return EVENTS.flatMap(event => commands.filter(command => command.event === event))
}

const isDeployEvent = function(event) {
  return event === 'onPostDeploy'
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
