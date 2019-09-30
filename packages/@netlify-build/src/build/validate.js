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
    validateMethod(propName, pluginName)
    return
  }

  validateNonMethod(propName, pluginName)
}

const validateMethod = function(propName, pluginName) {
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

const validateNonMethod = function(propName, pluginName) {
  if (!ALLOWED_PROPERTIES.includes(propName)) {
    console.log(chalk.redBright(`Invalid property '${propName}' in '${pluginName}'.`))
    console.log(`Please use a property name. One of:`)
    console.log(`${ALLOWED_PROPERTIES.map(name => `"${name}"`).join(', ')}`)
    throw new Error('Invalid plugin property')
  }
}

const ALLOWED_PROPERTIES = ['name', 'core', 'scopes']

module.exports = { validatePlugin }
