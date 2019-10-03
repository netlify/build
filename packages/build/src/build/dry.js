const { logDryRunStart, logDryRunInstruction, logDryRunEnd } = require('./log')

// If the `dry` option is specified, do a dry run
const doDryRun = function({ buildInstructions, configPath, options: { dry } }) {
  if (!dry) {
    return
  }

  logDryRunStart()

  const width = Math.max(...buildInstructions.map(({ hook }) => hook.length))
  buildInstructions.forEach((instruction, index) => logDryRunInstruction({ instruction, index, configPath, width }))

  logDryRunEnd()

  process.exit(0)
}

module.exports = { doDryRun }
