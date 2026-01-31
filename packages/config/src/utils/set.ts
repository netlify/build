import isPlainObj from 'is-plain-obj'

type Key = string | number

/**
 * Set a property deeply using an array of `keys` which can be either strings
 * (object properties) or integers (array indices).
 * Adds default values when intermediary properties are undefined or have the
 * wrong type. Also extends arrays when they are too small for a given index.
 * Does not mutate.
 */
export const setProp = function (parent: unknown, keys: Key[], value: unknown): any {
  if (keys.length === 0) {
    return value
  }

  const [firstKey, ...restKeys] = keys

  if (typeof firstKey === 'number') {
    return setArrayProp(parent, firstKey, restKeys, value)
  }

  return setObjectProp(parent, firstKey, restKeys, value)
}

const setArrayProp = function (parent: unknown, index: number, keys: Key[], value: unknown): any[] {
  const arrayParent = Array.isArray(parent) ? parent : []
  const missingItems = index - arrayParent.length + 1
  const normalizedParent = missingItems > 0 ? [...arrayParent, ...new Array(missingItems)] : arrayParent
  const newValue = setProp(normalizedParent[index], keys, value)
  return [...normalizedParent.slice(0, index), newValue, ...normalizedParent.slice(index + 1)]
}

const setObjectProp = function (parent: unknown, key: string, keys: Key[], value: unknown): object {
  const objectParent = isPlainObj(parent) ? (parent as Record<string, unknown>) : {}
  const newValue = setProp(objectParent[key], keys, value)
  return { ...objectParent, [key]: newValue }
}
