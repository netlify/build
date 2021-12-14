import isPlainObj from 'is-plain-obj'

// Set a property deeply using an array of `keys` which can be either strings
// (object properties) or integers (array indices).
// Adds default values when intermediary properties are undefined or have the
// wrong type. Also extends arrays when they are too small for a given index.
// Does not mutate.
export const setProp = function (parent, keys, value) {
  if (keys.length === 0) {
    return value
  }

  if (Number.isInteger(keys[0])) {
    return setArrayProp(parent, keys, value)
  }

  return setObjectProp(parent, keys, value)
}

const setArrayProp = function (parent, [index, ...keys], value) {
  const arrayParent = Array.isArray(parent) ? parent : []
  const missingItems = index - arrayParent.length + 1
  // eslint-disable-next-line unicorn/no-new-array
  const normalizedParent = missingItems > 0 ? [...arrayParent, ...new Array(missingItems)] : arrayParent
  const newValue = setProp(normalizedParent[index], keys, value)
  return [...normalizedParent.slice(0, index), newValue, ...normalizedParent.slice(index + 1)]
}

const setObjectProp = function (parent, [key, ...keys], value) {
  const objectParent = isPlainObj(parent) ? parent : {}
  const newValue = setProp(objectParent[key], keys, value)
  return { ...objectParent, [key]: newValue }
}
