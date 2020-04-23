const { logDryRunStart, logDryRunCommand, logDryRunEnd } = require('../log/main')

const { isSuccessCommand } = require('./commands')

// If the `dry` flag is specified, do a dry run
const doDryRun = function({ commands, commandsCount, configPath }) {
  const successCommands = commands.filter(isSuccessCommand)
  const eventWidth = Math.max(...successCommands.map(getEventLength))

  logDryRunStart(eventWidth, commandsCount)

  successCommands.forEach((command, index) => {
    logDryRunCommand({ command, index, configPath, eventWidth, commandsCount })
  })

  logDryRunEnd()
}

const getEventLength = function({ event }) {
  return event.length
}

module.exports = { doDryRun }
