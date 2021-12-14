'use strict'

const { addErrorInfo } = require('../../error/info')
const { serializeArray } = require('../../log/serialize')
const { listEvents } = require('../events')

// Validate the shape of a plugin return value
const validatePlugin = async function (logic) {
  try {
    // This validation must work with the return value of `import()` which has
    // a `Module` prototype, not `Object`
    if (typeof logic !== 'object' || logic === null) {
      throw new Error('Plugin must be an object or a function')
    }

    const EVENTS = await listEvents()
    Object.entries(logic).forEach(([propName, value]) => {
      validateEventHandler(value, propName, EVENTS)
    })
  } catch (error) {
    addErrorInfo(error, { type: 'pluginValidation' })
    throw error
  }
}

// All other properties are event handlers
const validateEventHandler = function (value, propName, EVENTS) {
  if (!EVENTS.includes(propName)) {
    throw new Error(`Invalid event '${propName}'.
Please use a valid event name. One of:
${serializeArray(EVENTS)}`)
  }

  if (typeof value !== 'function') {
    throw new TypeError(`Invalid event handler '${propName}': must be a function`)
  }
}

module.exports = { validatePlugin }
