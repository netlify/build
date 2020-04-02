const { EVENTS, LEGACY_EVENTS } = require('@netlify/config')
const isPlainObj = require('is-plain-obj')

const { serializeList } = require('../../utils/list')
const { failBuild } = require('../error')

// Validate the shape of a plugin return value
const validatePlugin = function(logic) {
  if (!isPlainObj(logic)) {
    failBuild('Plugin must be an object or a function')
  }

  Object.entries(logic).forEach(([propName, value]) => validateProperty(value, propName))
}

const validateProperty = function(value, propName) {
  if (DEPRECATED_PROPERTIES.includes(propName)) {
    return
  }

  // All other properties are event handlers
  validateEventHandler(value, propName)
}

// Backward compatibility. This is now in manifest.yml
// TODO: remove after migrating existing plugins
const DEPRECATED_PROPERTIES = ['name', 'inputs', 'config', 'scopes']

const validateEventHandler = function(value, propName) {
  if (!EVENTS.includes(propName) && LEGACY_EVENTS[propName] === undefined) {
    failBuild(`Invalid event '${propName}'.
Please use a valid event name. One of:
${serializeList(EVENTS)}`)
  }

  if (typeof value !== 'function') {
    failBuild(`Invalid event handler '${propName}': must be a function`)
  }
}

module.exports = { validatePlugin }
