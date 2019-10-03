const { runInstructions } = require('./instructions')
const { logInstructionsError, logErrorInstructions } = require('./log')

// Error handler when an instruction fails
// Resolve all 'onError' methods and try to fix things
const handleInstructionError = async function({ errorInstructions, config, configPath, token, baseDir, error }) {
  logInstructionsError()

  if (errorInstructions.length !== 0) {
    logErrorInstructions()
    await runInstructions(errorInstructions, { config, configPath, token, baseDir, error })
  }
}

module.exports = { handleInstructionError }
