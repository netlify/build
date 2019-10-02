const API = require('netlify')
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

  validateNonMethod(value, propName, pluginName)
}

const validateMethod = function(propName, pluginName) {
  const hook = propName.replace(OVERRIDE_REGEXP, '')

  if (!LIFECYCLE.includes(hook)) {
    console.log(chalk.redBright(`Invalid lifecycle hook '${hook}' in '${pluginName}'.`))
    console.log(`Please use a valid event name. One of:`)
    console.log(serializeList(LIFECYCLE))
    throw new Error(`Invalid lifecycle hook`)
  }
}

// Hooks can start with `pluginName:` to override another plugin
const OVERRIDE_REGEXP = /^[^:]+:/

const validateNonMethod = function(value, propName, pluginName) {
  if (!ALLOWED_PROPERTIES.includes(propName)) {
    console.log(chalk.redBright(`Invalid property '${propName}' in '${pluginName}'.`))
    console.log(`Please use a property name. One of:`)
    console.log(serializeList(ALLOWED_PROPERTIES))
    throw new Error('Invalid plugin property')
  }

  if (propName === 'scopes') {
    validateScopes(value, pluginName)
  }
}

const ALLOWED_PROPERTIES = ['name', 'core', 'scopes']

const validateScopes = function(scopes, pluginName) {
  const wrongScopes = scopes.filter(scope => !isValidScope(scope))
  if (wrongScopes.length === 0) {
    return
  }

  console.log(chalk.redBright(`Invalid scopes ${serializeList(wrongScopes)} in '${pluginName}'`))
  console.log(chalk.white.bold(`Please use a valid scope. One of:`))
  console.log(serializeList(ALLOWED_SCOPES))
  console.log()
  throw new Error(`Invalid scopes property`)
}

const isValidScope = function(scope) {
  return ALLOWED_SCOPES.includes(scope)
}

const ALLOWED_SCOPES = ['*', ...Object.keys(API.prototype)]

const serializeList = function(array) {
  return array.map(quote).join(', ')
}

const quote = function(string) {
  return `"${string}"`
}

module.exports = { validatePlugin }
