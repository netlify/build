const { logDryRunStart, logDryRunCommand, logDryRunEnd } = require('../log/main')

// If the `dry` flag is specified, do a dry run
const doDryRun = function({ mainCommands, commandsCount, configPath }) {
  const hookWidth = Math.max(...mainCommands.map(getHookLength))

  logDryRunStart(hookWidth, commandsCount)

  mainCommands.forEach((command, index) => {
    logDryRunCommand({ command, index, configPath, hookWidth, commandsCount })
  })

  logDryRunEnd()
}

const getHookLength = function({ hook }) {
  return hook.length
}

module.exports = { doDryRun }
