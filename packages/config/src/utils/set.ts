import isPlainObj from 'is-plain-obj'

/**
 * Set a deeply nested property, without mutating `parent`. String keys are object properties and
 * integer keys are array indices. Missing or mistyped intermediate values are replaced, and arrays
 * are extended as needed.
 */
export const setProp = function (parent: unknown, keys: readonly (string | number)[], value: unknown): unknown {
  const [key, ...childKeys] = keys
  if (key === undefined) {
    return value
  }

  if (typeof key === 'number' && Number.isInteger(key)) {
    const array: unknown[] = Array.isArray(parent) ? parent : []
    const extended = array.length > key ? array : [...array, ...new Array<unknown>(key - array.length + 1)]
    return [...extended.slice(0, key), setProp(extended[key], childKeys, value), ...extended.slice(key + 1)]
  }

  const object: Record<string | number, unknown> = isPlainObj(parent) ? parent : {}
  return { ...object, [key]: setProp(object[key], childKeys, value) }
}
