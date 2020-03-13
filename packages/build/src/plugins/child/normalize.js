const mapObj = require('map-obj')
const { LEGACY_EVENTS } = require('@netlify/config')

// Normalize plugin shape
const normalizePlugin = function(logic) {
  return mapObj(logic, normalizeProperty)
}

const normalizeProperty = function(key, value) {
  const newKey = LEGACY_PROPERTIES[key]

  if (newKey === undefined) {
    return [key, value]
  }

  return [newKey, value]
}

const LEGACY_PROPERTIES = {
  ...LEGACY_EVENTS,
  // Backward compatibility with former name.
  // TODO: remove after going out of beta.
  config: 'inputs',
}

module.exports = { normalizePlugin }
