const API = require('netlify')
const isPlainObj = require('is-plain-obj')

const { LIFECYCLE } = require('../../core/lifecycle')

// Validate the shape of a plugin return value
// TODO: validate allowed characters in `logic` properties
const validatePlugin = function(logic, type) {
  if (!isPlainObj(logic)) {
    throw new Error(`Plugin must be an object or a function`)
  }

  validateRequiredProperties(logic, type)

  Object.entries(logic).forEach(([propName, value]) => validateProperty(value, propName))
}

// Validate `plugin.*` required properties
const validateRequiredProperties = function(logic, type) {
  REQUIRED_PROPERTIES.forEach(validation => validateRequiredProperty(logic, validation, type))
}

const REQUIRED_PROPERTIES = [{
  key: 'name',
  errorMsg: `
> Attention Beta testers!
> Please add the required "name" property to the object exported from the plugin.
> This is a new required field from plugins http://bit.ly/31z46mF\n

Example:

function netlifyPlugin(config) {
  return {
    name: 'my-plugin-name', <--- New required "name" field
    init: () => {
      console.log('Hi from init')
    },
  }
}
`
}]

const validateRequiredProperty = function(logic, validation, type) {
  if (logic[validation.key] === undefined) {
    const msg = validation.errorMsg || ''
    throw new Error(`Missing required property '${validation.key}' in ${type}\n${msg}`)
  }
}

const validateProperty = function(value, propName) {
  if (typeof value === 'function') {
    validateMethod(propName)
    return
  }

  validateNonMethod(value, propName)
}

// Validate `plugin.*` hook methods
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

  /* Disable forced prefix. TODO figure out if we want this
  if (!name.startsWith('@netlify/plugin-') && !name.startsWith('netlify-plugin-')) {
    throw new Error(`Property 'name' must starts with 'netlify-plugin-*' and match the package name`)
  }
  */
}

// Validate `plugin.scopes`
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

const VALIDATORS = { name: validateName, scopes: validateScopes }

const serializeList = function(array) {
  return array.map(quote).join(', ')
}

const quote = function(string) {
  return `"${string}"`
}

module.exports = { validatePlugin }
