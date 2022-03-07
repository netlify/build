import { isDeepStrictEqual } from 'util'

import isPlainObj from 'is-plain-obj'
import rfdc from 'rfdc'

const clone = rfdc()

// Copy `netlifyConfig` so we can compare before/after mutating it
export const cloneNetlifyConfig = function (netlifyConfig) {
  return clone(netlifyConfig)
}

// Diff `netlifyConfig` before and after mutating it to retrieve an array of
// `configMutations` objects.
// We need to keep track of the changes on `netlifyConfig` so they can be
// processed later to:
//  - Warn plugin authors when mutating read-only properties
//  - Apply the change to `netlifyConfig` in the parent process so it can
//    run `@netlify/config` to normalize and validate the new values
// `configMutations` is passed to parent process as JSON
export const getConfigMutations = function (netlifyConfig, netlifyConfigCopy, event) {
  const configMutations = diffObjects(netlifyConfig, netlifyConfigCopy, [])
  return configMutations.map((configMutation) => getConfigMutation(configMutation, event))
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

    if (isDeepStrictEqual(valueA, valueB)) {
      return []
    }

    return [{ keys, value: valueB }]
  })
}

const getConfigMutation = function ({ keys, value }, event) {
  const serializedKeys = keys.map(String)
  return {
    keys: serializedKeys,
    keysString: serializedKeys.join('.'),
    value,
    event,
  }
}
