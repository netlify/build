const mapObj = require('map-obj')
const { LEGACY_EVENTS } = require('@netlify/config')

const { getOutputs } = require('../outputs/when')

// Normalize plugin shape
const normalizePlugin = function(logic) {
  const logicA = mapObj(logic, normalizeProperty)
  const logicB = getOutputs(logicA)
  return logicB
}

const normalizeProperty = function(key, value) {
  const newKey = LEGACY_EVENTS[key]

  if (newKey === undefined) {
    return [key, value]
  }

  return [newKey, value]
}

module.exports = { normalizePlugin }
