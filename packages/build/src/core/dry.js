'use strict'

const { logDryRunStart, logDryRunCommand, logDryRunEnd } = require('../log/messages/dry')
const { runsOnlyOnBuildFailure } = require('../plugins/events')

// If the `dry` flag is specified, do a dry run
const doDryRun = async function ({ buildDir, commands, netlifyConfig, constants, buildbotServerSocket, logs }) {
  const evaluatedConditions = await Promise.all(
    commands.map(({ event, condition }) =>
      shouldIncludeCommand({ buildDir, event, condition, netlifyConfig, constants, buildbotServerSocket }),
    ),
  )
  const successCommands = commands.filter((_, index) => evaluatedConditions[index] === true)
  const eventWidth = Math.max(...successCommands.map(getEventLength))
  const commandsCount = successCommands.length

  logDryRunStart({ logs, eventWidth, commandsCount })

  successCommands.forEach((command, index) => {
    logDryRunCommand({ logs, command, index, netlifyConfig, eventWidth, commandsCount })
  })

  logDryRunEnd(logs)
}

const shouldIncludeCommand = async function ({
  buildDir,
  event,
  condition,
  netlifyConfig,
  constants,
  buildbotServerSocket,
}) {
  return (
    !runsOnlyOnBuildFailure(event) &&
    (condition === undefined || (await condition({ buildDir, constants, netlifyConfig, buildbotServerSocket })))
  )
}

const getEventLength = function ({ event }) {
  return event.length
}

module.exports = { doDryRun }
