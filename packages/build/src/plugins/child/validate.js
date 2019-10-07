const API = require('netlify')
const isPlainObj = require('is-plain-obj')

const { LIFECYCLE } = require('../../core/lifecycle')

// Validate the shape of a plugin return value
// TODO: validate allowed characters in `logic` properties
const validatePlugin = function(logic) {
  if (!isPlainObj(logic)) {
    throw new Error(`Plugin must be an object or a function`)
  }

  Object.entries(logic).forEach(([propName, value]) => validateProperty(value, propName))
}

const validateProperty = function(value, propName) {
  if (typeof value === 'function') {
    validateMethod(propName)
    return
  }

  validateNonMethod(value, propName)
}

const validateMethod = function(propName) {
  const hook = propName.replace(OVERRIDE_REGEXP, '')

  if (!LIFECYCLE.includes(hook)) {
    throw new Error(`Invalid lifecycle hook '${hook}'.
Please use a valid event name. One of:
${serializeList(LIFECYCLE)}`)
  }
}

// Hooks can start with `pluginName:` to override another plugin
const OVERRIDE_REGEXP = /^[^:]+:/

const validateNonMethod = function(value, propName) {
  if (!ALLOWED_PROPERTIES.includes(propName)) {
    throw new Error(`Invalid property '${propName}'.
Please use a property name. One of:
${serializeList(ALLOWED_PROPERTIES)}`)
  }

  if (propName === 'scopes') {
    validateScopes(value)
  }
}

const ALLOWED_PROPERTIES = ['scopes']

const validateScopes = function(scopes) {
  const wrongScopes = scopes.filter(scope => !isValidScope(scope))
  if (wrongScopes.length === 0) {
    return
  }

  throw new Error(`Invalid scopes ${serializeList(wrongScopes)}.
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
