'use strict'

const { logDryRunStart, logDryRunCommand, logDryRunEnd } = require('../log/messages/dry')
const { runsOnlyOnBuildFailure } = require('../plugins/events')

// If the `dry` flag is specified, do a dry run
const doDryRun = function ({ commands, constants, featureFlags, buildbotServerSocket, logs }) {
  const successCommands = commands.filter(({ event, condition }) =>
    shouldIncludeCommand({ event, condition, constants, featureFlags, buildbotServerSocket }),
  )
  const eventWidth = Math.max(...successCommands.map(getEventLength))
  const commandsCount = successCommands.length

  logDryRunStart({ logs, eventWidth, commandsCount })

  successCommands.forEach((command, index) => {
    logDryRunCommand({ logs, command, index, eventWidth, commandsCount })
  })

  logDryRunEnd(logs)
}

const shouldIncludeCommand = function ({ event, condition, constants, featureFlags, buildbotServerSocket }) {
  return (
    !runsOnlyOnBuildFailure(event) &&
    (condition === undefined || condition({ constants, featureFlags, buildbotServerSocket }))
  )
}

const getEventLength = function ({ event }) {
  return event.length
}

module.exports = { doDryRun }
