const { logDryRunStart, logDryRunInstruction, logDryRunEnd } = require('../log/main')

// If the `dry` option is specified, do a dry run
const doDryRun = function({ buildInstructions, configPath }) {
  logDryRunStart()

  const width = Math.max(...buildInstructions.map(getHookLength))
  buildInstructions.forEach((instruction, index) => {
    logDryRunInstruction({ instruction, index, configPath, width, buildInstructions })
  })

  logDryRunEnd()
}

const getHookLength = function({ hook }) {
  return hook.length
}

module.exports = { doDryRun }
