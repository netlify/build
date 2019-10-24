const { logErrorInstructions } = require('../log/main')

const { runInstructions } = require('./instructions')

// Error handler when an instruction fails
// Resolve all 'onError' methods and try to fix things
const handleInstructionError = async function(errorInstructions, { config, configPath, token, baseDir, error }) {
  if (errorInstructions.length !== 0) {
    logErrorInstructions()
    await runInstructions(errorInstructions, { config, configPath, token, baseDir, error })
  }
}

module.exports = { handleInstructionError }
