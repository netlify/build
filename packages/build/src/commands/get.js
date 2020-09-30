const { EVENTS } = require('../plugins/events')

// Get commands for all events
const getCommands = function(pluginsCommands, netlifyConfig) {
  const commands = addBuildCommand(pluginsCommands, netlifyConfig)
  const commandsA = sortCommands(commands)
  const commandsCount = commandsA.filter(({ event }) => !runsOnlyOnBuildFailure(event)).length
  const events = getEvents(commandsA)
  return { commands: commandsA, commandsCount, events }
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

// Retrieve list of unique events
const getEvents = function(commands) {
  const events = commands.map(getEvent)
  return [...new Set(events)]
}

const getEvent = function({ event }) {
  return event
}

const isAmongEvents = function(events, event) {
  return events.includes(event)
}

// Check if failure of the event should not make the build fail
const isSoftFailEvent = isAmongEvents.bind(null, ['onSuccess', 'onError', 'onEnd'])

// Check if the event is triggered even when the build fails
const runsAlsoOnBuildFailure = isAmongEvents.bind(null, ['onError', 'onEnd'])

// Check if the event is only triggered when the build fails
const runsOnlyOnBuildFailure = isAmongEvents.bind(null, ['onError'])

// Check if the event is happening after deploy
const runsAfterDeploy = isAmongEvents.bind(null, ['onSuccess', 'onEnd'])

module.exports = { getCommands, isSoftFailEvent, runsAlsoOnBuildFailure, runsOnlyOnBuildFailure, runsAfterDeploy }
