const isPlainObj = require('is-plain-obj')
const { EVENTS, LEGACY_EVENTS } = require('@netlify/config')

const { serializeList } = require('../../utils/list')
const { validateConfigSchema } = require('../config/validate_config')

const { API_METHODS } = require('./api')

// Validate the shape of a plugin return value
// TODO: validate allowed characters in `logic` properties
const validatePlugin = function(logic) {
  if (!isPlainObj(logic)) {
    throw new Error(`Plugin must be an object or a function`)
  }

  validateRequiredProperties(logic)

  Object.entries(logic).forEach(([propName, value]) => validateProperty(value, propName))
}

// Validate `plugin.*` required properties
const validateRequiredProperties = function(logic) {
  REQUIRED_PROPERTIES.forEach(propName => validateRequiredProperty(logic, propName))
}

const REQUIRED_PROPERTIES = ['name']

const validateRequiredProperty = function(logic, propName) {
  if (logic[propName] === undefined) {
    throw new Error(`Missing required property '${propName}'`)
  }
}

const validateProperty = function(value, propName) {
  if (typeof value === 'function') {
    validateMethod(propName)
    return
  }

  validateNonMethod(value, propName)
}

// Validate `plugin.*` event handlers
const validateMethod = function(propName) {
  const propNameA = propName.replace(OVERRIDE_REGEXP, '')

  if (!EVENTS.includes(propNameA) && LEGACY_EVENTS[propNameA] === undefined) {
    throw new Error(`Invalid event '${propNameA}'.
Please use a valid event name. One of:
${serializeList(EVENTS)}`)
  }
}

// Event handlers can start with `pluginName:` to override another plugin
const OVERRIDE_REGEXP = /^[^:]+:/

const validateNonMethod = function(value, propName) {
  const validator = VALIDATORS[propName]

  if (validator === undefined) {
    throw new Error(`Invalid property '${propName}'.
Please use a property name. One of:
${serializeList(Object.keys(VALIDATORS))}`)
  }

  validator(value)
}

// Validate `plugin.name`
const validateName = function(name) {
  if (typeof name !== 'string') {
    throw new Error(`Property 'name' must be a string`)
  }
}

// Validate `plugin.scopes`
const validateScopes = function(scopes) {
  const wrongScope = scopes.find(scope => !isValidScope(scope))
  if (wrongScope === undefined) {
    return
  }

  throw new Error(`Invalid scope "${wrongScope}"
Please use a valid scope. One of:
${serializeList(ALLOWED_SCOPES)}`)
}

const isValidScope = function(scope) {
  return ALLOWED_SCOPES.includes(scope)
}

const ALLOWED_SCOPES = ['*', ...API_METHODS]

const VALIDATORS = { name: validateName, scopes: validateScopes, config: validateConfigSchema }

module.exports = { validatePlugin }
