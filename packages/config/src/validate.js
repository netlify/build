// Validate the configuration object
const validateConfig = function(config) {
  validateOldCommand(config)
  warnPluginArray(config)
}

const validateOldCommand = function({ build: { command, lifecycle } = {} }) {
  if (command !== undefined && lifecycle !== undefined) {
    throw new Error(
      `'build.command' and 'build.lifecycle' are both defined in the configuration. Please rename 'build.command' to 'build.lifecycle.build'`,
    )
  }
}

// TODO: remove after beta testing is over
const warnPluginArray = function({ plugins }) {
  if (plugins !== undefined && !Array.isArray(plugins)) {
    throw new Error(`Attention beta testers!
Plugins have been changed from an object to an array.
Please update your plugins property accordingly.

plugins:
  - type: npm-module-path
    config:
      fizz: pop
  - type: ./plugin/path
    config:
      foo: bar

See more information in the docs http://bit.ly/31z46mF`)
  }
}

module.exports = { validateConfig }
