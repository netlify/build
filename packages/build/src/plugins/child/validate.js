'use strict'

const isPlainObj = require('is-plain-obj')

const { addErrorInfo } = require('../../error/info')
const { serializeArray } = require('../../log/serialize')
const { EVENTS } = require('../events')

// Validate the shape of a plugin return value
const validatePlugin = function (logic) {
  try {
    if (!isPlainObj(logic)) {
      throw new Error('Plugin must be an object or a function')
    }

    Object.entries(logic).forEach(([propName, value]) => {
      validateEventHandler(value, propName)
    })
  } catch (error) {
    addErrorInfo(error, { type: 'pluginValidation' })
    throw error
  }
}

// All other properties are event handlers
const validateEventHandler = function (value, propName) {
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
