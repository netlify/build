const { EVENTS } = require('../plugins/events')

// Get commands for all events
const getCommands = function(pluginsCommands, netlifyConfig) {
  const commands = addBuildCommand(pluginsCommands, netlifyConfig)
  const commandsA = sortCommands(commands)
  const commandsCount = commandsA.filter(({ event }) => !isErrorOnlyEvent(event)).length
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

const isAmongEvents = function(events, event) {
  return events.includes(event)
}

// Check if failure of the event should not make the build fail
const isSoftFailEvent = isAmongEvents.bind(null, ['onSuccess', 'onError', 'onEnd'])

// Check if the event is triggered even when an error happens
const isErrorEvent = isAmongEvents.bind(null, ['onError', 'onEnd'])

// Check if the event is only triggered when an error happens
const isErrorOnlyEvent = isAmongEvents.bind(null, ['onError'])

module.exports = { getCommands, isSoftFailEvent, isErrorEvent, isErrorOnlyEvent }
