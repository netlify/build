const API = require('netlify')
const isPlainObj = require('is-plain-obj')

const { LIFECYCLE } = require('../core/lifecycle')

// Validate the shape of a plugin return value
// TODO: validate allowed characters in `plugin` properties
const validatePlugin = function(plugin, pluginId) {
  if (!isPlainObj(plugin)) {
    throw new Error(`Plugin ${pluginId} must be an object or a function`)
  }

  Object.entries(plugin).forEach(([propName, value]) => validateProperty(value, propName, pluginId))
}

const validateProperty = function(value, propName, pluginId) {
  if (typeof value === 'function') {
    validateMethod(propName, pluginId)
    return
  }

  validateNonMethod(value, propName, pluginId)
}

const validateMethod = function(propName, pluginId) {
  const hook = propName.replace(OVERRIDE_REGEXP, '')

  if (!LIFECYCLE.includes(hook)) {
    throw new Error(`Invalid lifecycle hook '${hook}' in '${pluginId}'.
Please use a valid event name. One of:
${serializeList(LIFECYCLE)}`)
  }
}

// Hooks can start with `pluginName:` to override another plugin
const OVERRIDE_REGEXP = /^[^:]+:/

const validateNonMethod = function(value, propName, pluginId) {
  if (!ALLOWED_PROPERTIES.includes(propName)) {
    throw new Error(`Invalid property '${propName}' in '${pluginId}'.
Please use a property name. One of:
${serializeList(ALLOWED_PROPERTIES)}`)
  }

  if (propName === 'scopes') {
    validateScopes(value, pluginId)
  }
}

const ALLOWED_PROPERTIES = ['scopes']

const validateScopes = function(scopes, pluginId) {
  const wrongScopes = scopes.filter(scope => !isValidScope(scope))
  if (wrongScopes.length === 0) {
    return
  }

  throw new Error(`Invalid scopes ${serializeList(wrongScopes)} in '${pluginId}'
Please use a valid scope. One of:
${serializeList(ALLOWED_SCOPES)}`)
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
