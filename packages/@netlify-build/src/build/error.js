const {
  env: { ERROR_VERBOSE }
} = require('process')

const chalk = require('chalk')

const cleanStack = require('../utils/clean-stack')

const { runInstructions } = require('./instructions')

// Error handler when an instruction fails
const handleInstructionError = async function({
  errorInstructions,
  netlifyConfig,
  netlifyConfigPath,
  netlifyToken,
  baseDir,
  error
}) {
  logInstructionError()

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

const logInstructionError = function() {
  console.log()
  console.log(chalk.redBright.bold('┌─────────────────────┐'))
  console.log(chalk.redBright.bold('│  Lifecycle Error!   │'))
  console.log(chalk.redBright.bold('└─────────────────────┘'))
}

const logErrorInstructions = function() {
  console.log()
  console.log(chalk.cyanBright('Running onError methods'))
}

const logBuildError = function(error) {
  console.log()
  console.log(chalk.redBright.bold('┌─────────────────────────────┐'))
  console.log(chalk.redBright.bold('│    Netlify Build Error!     │'))
  console.log(chalk.redBright.bold('└─────────────────────────────┘'))
  console.log(chalk.bold(` ${error.message}`))
  console.log()
  console.log(chalk.yellowBright.bold('┌─────────────────────────────┐'))
  console.log(chalk.yellowBright.bold('│      Error Stack Trace      │'))
  console.log(chalk.yellowBright.bold('└─────────────────────────────┘'))

  if (ERROR_VERBOSE) {
    console.log(error.stack)
  } else {
    console.log(` ${chalk.bold(cleanStack(error.stack))}`)
    console.log()
    console.log(` Set environment variable ERROR_VERBOSE=true for deep traces`)
  }

  console.log()
}

module.exports = { handleInstructionError, logBuildError }
