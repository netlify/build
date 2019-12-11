const { logDryRunStart, logDryRunCommand, logDryRunEnd } = require('../log/main')

// If the `dry` flag is specified, do a dry run
const doDryRun = function({ mainCommands, commandsCount, configPath }) {
  const eventWidth = Math.max(...mainCommands.map(getEventLength))

  logDryRunStart(eventWidth, commandsCount)

  mainCommands.forEach((command, index) => {
    logDryRunCommand({ command, index, configPath, eventWidth, commandsCount })
  })

  logDryRunEnd()
}

const getEventLength = function({ event }) {
  return event.length
}

module.exports = { doDryRun }
