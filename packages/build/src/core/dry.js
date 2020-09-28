const { runsOnlyOnBuildFailure } = require('../commands/get')
const { logDryRunStart, logDryRunCommand, logDryRunEnd } = require('../log/messages/dry')

// If the `dry` flag is specified, do a dry run
const doDryRun = function({ commands, commandsCount, logs }) {
  const successCommands = commands.filter(({ event }) => !runsOnlyOnBuildFailure(event))
  const eventWidth = Math.max(...successCommands.map(getEventLength))

  logDryRunStart({ logs, eventWidth, commandsCount })

  successCommands.forEach((command, index) => {
    logDryRunCommand({ logs, command, index, eventWidth, commandsCount })
  })

  logDryRunEnd(logs)
}

const getEventLength = function({ event }) {
  return event.length
}

module.exports = { doDryRun }
