const chalk = require('chalk')
const isPlainObj = require('is-plain-obj')

const { LIFECYCLE } = require('./lifecycle')

// Validate the shape of a plugin
const validatePlugin = function(plugin, pluginName) {
  if (!isPlainObj(plugin)) {
    throw new Error(`Plugin ${pluginName} is malformed. Must be object or function`)
  }

  Object.entries(plugin).forEach(([propName, value]) => validateProperty(value, propName, pluginName))
}

const validateProperty = function(value, propName, pluginName) {
  if (typeof value === 'function') {
    return validateHook(propName, pluginName)
  }
}

const validateHook = function(propName, pluginName) {
  const hook = propName.replace(OVERRIDE_REGEXP, '')

  if (!LIFECYCLE.includes(hook)) {
    console.log(chalk.redBright(`Invalid lifecycle hook '${hook}' in '${pluginName}'.`))
    console.log(`Please use a valid event name. One of:`)
    console.log(`${LIFECYCLE.map(name => `"${name}"`).join(', ')}`)
    throw new Error(`Invalid lifecycle hook`)
  }
}

// Hooks can start with `pluginName:` to override another plugin
const OVERRIDE_REGEXP = /^[^:]+:/

module.exports = { validatePlugin }
