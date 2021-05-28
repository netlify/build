'use strict'

const { EVENTS } = require('../plugins/events')
const { getBuildCommandCore } = require('../plugins_core/build_command')
const { deploySite } = require('../plugins_core/deploy')
const { bundleFunctions } = require('../plugins_core/functions')

// Get commands for all events
const getCommands = function (commands, netlifyConfig) {
  const commandsA = addCoreCommands(commands, netlifyConfig)
  const commandsB = sortCommands(commandsA)
  const events = getEvents(commandsB)
  return { commands: commandsB, events }
}

const addCoreCommands = function (commands, netlifyConfig) {
  return [getBuildCommandCore(netlifyConfig), ...commands, bundleFunctions, deploySite]
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
