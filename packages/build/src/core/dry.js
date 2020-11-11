'use strict'

const { runsOnlyOnBuildFailure } = require('../commands/get')
const { logDryRunStart, logDryRunCommand, logDryRunEnd } = require('../log/messages/dry')

// If the `dry` flag is specified, do a dry run
const doDryRun = function ({ commands, constants, logs }) {
  const successCommands = commands.filter(({ event, condition }) =>
    shouldIncludeCommand({ event, condition, constants }),
  )
  const eventWidth = Math.max(...successCommands.map(getEventLength))
  const commandsCount = successCommands.length

  logDryRunStart({ logs, eventWidth, commandsCount })

  successCommands.forEach((command, index) => {
    logDryRunCommand({ logs, command, index, eventWidth, commandsCount })
  })

  logDryRunEnd(logs)
}

const shouldIncludeCommand = function ({ event, condition, constants }) {
  return !runsOnlyOnBuildFailure(event) && (condition === undefined || condition({ constants }))
}

const getEventLength = function ({ event }) {
  return event.length
}

module.exports = { doDryRun }
