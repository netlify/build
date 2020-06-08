const isPlainObj = require('is-plain-obj')

const { serializeArray } = require('../../log/serialize')
const { ERROR_TYPE_SYM, validateOldProperty } = require('../error')
const { EVENTS, LEGACY_EVENTS } = require('../events')

// Validate the shape of a plugin return value
const validatePlugin = function(logic) {
  try {
    if (!isPlainObj(logic)) {
      throw new Error('Plugin must be an object or a function')
    }

    validateOldProperties(logic)

    Object.entries(logic).forEach(([propName, value]) => validateEventHandler(value, propName))
  } catch (error) {
    error[ERROR_TYPE_SYM] = 'pluginValidation'
    throw error
  }
}

// Backward compatibility warnings.
// TODO: remove once no plugins is doing this anymore.
const validateOldProperties = function(logic) {
  validateOldProperty(
    logic,
    'name',
    'The "name" plugin property has moved from the main plugin file to a "manifest.yml" instead',
  )
  validateOldProperty(
    logic,
    'inputs',
    'The "inputs" plugin property has moved from the main plugin file to a "manifest.yml" instead',
  )
  validateOldProperty(
    logic,
    'config',
    'The "config" plugin property has moved from the main plugin file to a "manifest.yml" instead and renamed "inputs"',
  )
}

// All other properties are event handlers
const validateEventHandler = function(value, propName) {
  // TODO: remove once no plugins is doing this anymore.
  if (LEGACY_EVENTS[propName] !== undefined) {
    throw new Error(`Event handler '${propName}' has been renamed to '${LEGACY_EVENTS[propName]}'`)
  }

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
