const { runInstructions } = require('./instructions')
const { logInstructionsError, logErrorInstructions } = require('./log')

// Error handler when an instruction fails
const handleInstructionError = async function({
  errorInstructions,
  netlifyConfig,
  netlifyConfigPath,
  netlifyToken,
  baseDir,
  error
}) {
  logInstructionsError()

  if (errorInstructions.length !== 0) {
    logErrorInstructions()
    // Resolve all ‘onError’ methods and try to fix things
    await runInstructions(errorInstructions, {
      netlifyConfig,
      netlifyConfigPath,
      netlifyToken,
      baseDir,
      error
    })
  }
}

module.exports = { handleInstructionError }
