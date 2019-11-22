const { logDryRunStart, logDryRunInstruction, logDryRunEnd } = require('../log/main')

// If the `dry` option is specified, do a dry run
const doDryRun = function({ buildInstructions, instructionsCount, configPath }) {
  const hookWidth = Math.max(...buildInstructions.map(getHookLength))

  logDryRunStart(hookWidth, instructionsCount)

  buildInstructions.forEach((instruction, index) => {
    logDryRunInstruction({ instruction, index, configPath, hookWidth, instructionsCount })
  })

  logDryRunEnd()
}

const getHookLength = function({ hook }) {
  return hook.length
}

module.exports = { doDryRun }
