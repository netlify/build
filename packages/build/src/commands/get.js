const { EVENTS } = require('../plugins/events')

// Get commands for all events
const getCommands = function(pluginsCommands, netlifyConfig) {
  const commands = addBuildCommand(pluginsCommands, netlifyConfig)
  const commandsA = sortCommands(commands)
  const commandsCount = commandsA.filter(isSuccessCommand).length
  return { commands: commandsA, commandsCount }
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

// Sort plugin commands by event order.
const sortCommands = function(commands) {
  return EVENTS.flatMap(event => commands.filter(command => command.event === event))
}

const isMainCommand = function({ event }) {
  return event !== 'onEnd' && event !== 'onError'
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

module.exports = { getCommands, isMainCommand, isErrorCommand, isSuccessCommand }
