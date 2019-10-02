// Validate the configuration object
const validateConfig = function(config) {
  validateOldCommand(config)
}

const validateOldCommand = function({ build: { command, lifecycle } = {} }) {
  if (command !== undefined && lifecycle !== undefined) {
    throw new Error(
      `'build.command' and 'build.lifecycle' are both defined in the configuration. Please rename 'build.command' to 'build.lifecycle.build'`
    )
  }
}

module.exports = { validateConfig }
