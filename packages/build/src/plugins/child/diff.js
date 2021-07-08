'use strict'

const fastDeepEqual = require('fast-deep-equal')
const isPlainObj = require('is-plain-obj')
const rfdc = require('rfdc')

const clone = rfdc()

// Copy `neltifyConfig` so we can compare before/after mutating it
const cloneNetlifyConfig = function (netlifyConfig) {
  return clone(netlifyConfig)
}

// Diff `netlifyConfig` before and after mutating it to retrieve an array of
// `configMutations` objects.
// We need to keep track of the changes on `netlifyConfig` so they can be
// processed later to:
//  - Warn plugin authors when mutating read-only properties
//  - Apply the change to `netlifyConfig` in the parent process so it can
//    run `@netlify/config` to normalize and validate the new values
const getConfigMutations = function (netlifyConfig, netlifyConfigCopy, event) {
  const configMutations = diffObjects(netlifyConfig, netlifyConfigCopy, [])
  return configMutations.map(({ keys, value }) => ({
    keys: keys.map(jsonNormalizeKey),
    keysString: serializeKeys(keys),
    value,
    event,
  }))
}

// We only recurse over plain objects, not arrays. Which means array properties
// can only be modified all at once.
const diffObjects = function (objA, objB, parentKeys) {
  const allKeys = [...new Set([...Object.keys(objA), ...Object.keys(objB)])]
  return allKeys.flatMap((key) => {
    const valueA = objA[key]
    const valueB = objB[key]
    const keys = [...parentKeys, key]

    if (isPlainObj(valueA) && isPlainObj(valueB)) {
      return diffObjects(valueA, valueB, keys)
    }

    if (fastDeepEqual(valueA, valueB)) {
      return []
    }

    return [{ keys, value: valueB }]
  })
}

const serializeKeys = function (keys) {
  return keys.map(String).join('.')
}

// `configMutations` is passed to parent process as JSON
const jsonNormalizeKey = function (key) {
  return typeof key === 'symbol' ? String(key) : key
}

module.exports = { cloneNetlifyConfig, getConfigMutations }
