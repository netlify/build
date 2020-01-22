const mapObj = require('map-obj')
const { LEGACY_EVENTS } = require('@netlify/config')

// Normalize plugin shape
const normalizePlugin = function(logic) {
  return mapObj(logic, normalizeProperty)
}

const normalizeProperty = function(key, value) {
  const newKey = LEGACY_EVENTS[key]

  if (newKey === undefined) {
    return [key, value]
  }

  return [newKey, value]
}

module.exports = { normalizePlugin }
