const isPlainObj = require('is-plain-obj')

const { serializeArray } = require('../../log/serialize')
const { ERROR_TYPE_SYM } = require('../error')
const { EVENTS, LEGACY_EVENTS } = require('../events')

// Validate the shape of a plugin return value
const validatePlugin = function(logic) {
  try {
    if (!isPlainObj(logic)) {
      throw new Error('Plugin must be an object or a function')
    }

    Object.entries(logic).forEach(([propName, value]) => validateProperty(value, propName))
  } catch (error) {
    error[ERROR_TYPE_SYM] = 'pluginValidation'
    throw error
  }
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
    throw new Error(`Invalid event '${propName}'.
Please use a valid event name. One of:
${serializeArray(EVENTS)}`)
  }

  if (typeof value !== 'function') {
    throw new Error(`Invalid event handler '${propName}': must be a function`)
  }
}

module.exports = { validatePlugin }
