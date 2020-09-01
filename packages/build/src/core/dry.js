const { isErrorOnlyEvent } = require('../commands/get')
const { logDryRunStart, logDryRunCommand, logDryRunEnd } = require('../log/main')

// If the `dry` flag is specified, do a dry run
const doDryRun = function({ commands, commandsCount, logs }) {
  const successCommands = commands.filter(({ event }) => !isErrorOnlyEvent(event))
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
