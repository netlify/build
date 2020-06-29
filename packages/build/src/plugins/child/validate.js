const isPlainObj = require('is-plain-obj')

const { serializeArray } = require('../../log/serialize')
const { ERROR_TYPE_SYM, validateOldProperty } = require('../error')
const { EVENTS } = require('../events')

// Validate the shape of a plugin return value
const validatePlugin = function(logic) {
  try {
    if (!isPlainObj(logic)) {
      throw new Error('Plugin must be an object or a function')
    }

    // Backward compatibility warning.
    // TODO: remove once no plugins is doing this anymore.
    validateOldProperty(
      logic,
      'name',
      'The "name" plugin property has moved from the main plugin file to a "manifest.yml" instead',
    )

    Object.entries(logic).forEach(([propName, value]) => validateEventHandler(value, propName))
  } catch (error) {
    error[ERROR_TYPE_SYM] = 'pluginValidation'
    throw error
  }
}

// All other properties are event handlers
const validateEventHandler = function(value, propName) {
  if (!EVENTS.includes(propName)) {
    throw new Error(`Invalid event '${propName}'.
Please use a valid event name. One of:
${serializeArray(EVENTS)}`)
  }

  if (typeof value !== 'function') {
    throw new Error(`Invalid event handler '${propName}': must be a function`)
  }
}

module.exports = { validatePlugin }
