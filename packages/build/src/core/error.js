const { logInstructionsError, logErrorInstructions } = require('../log/main')

const { runInstructions } = require('./instructions')

// Error handler when an instruction fails
// Resolve all 'onError' methods and try to fix things
const handleInstructionError = async function(
  errorInstructions,
  { childProcesses, configPath, baseDir, redactedKeys, error }
) {
  logInstructionsError()

  if (errorInstructions.length !== 0) {
    logErrorInstructions()
    await runInstructions(errorInstructions, { childProcesses, configPath, baseDir, redactedKeys, error })
  }
}

module.exports = { handleInstructionError }
