'use strict'

const { EVENTS } = require('../plugins/events')
const { deploySite } = require('../plugins_core/deploy')
const { bundleFunctions } = require('../plugins_core/functions')

// Get commands for all events
const getCommands = function ({ pluginsCommands, netlifyConfig }) {
  const commands = addBuildCommand(pluginsCommands, netlifyConfig)
  const commandsA = addCoreCommands(commands)
  const commandsB = sortCommands(commandsA)
  const events = getEvents(commandsB)
  return { commands: commandsB, events }
}

// Merge `build.command` with plugin event handlers
const addBuildCommand = function (
  pluginsCommands,
  { build: { command: buildCommand, commandOrigin: buildCommandOrigin } },
) {
  if (buildCommand === undefined) {
    return pluginsCommands
  }

  return [{ event: 'onBuild', buildCommand, buildCommandOrigin }, ...pluginsCommands]
}

const addCoreCommands = function (commands) {
  return [...commands, bundleFunctions, deploySite]
}

// Sort plugin commands by event order.
const sortCommands = function (commands) {
  return EVENTS.flatMap((event) => commands.filter((command) => command.event === event))
}

// Retrieve list of unique events
const getEvents = function (commands) {
  const events = commands.map(getEvent)
  return [...new Set(events)]
}

const getEvent = function ({ event }) {
  return event
}

module.exports = { getCommands }
