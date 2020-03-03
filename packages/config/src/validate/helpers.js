const { normalize } = require('path')

const isString = function(value) {
  return typeof value === 'string'
}

const isBoolean = function(value) {
  return typeof value === 'boolean'
}

const validProperties = function(
  propNames,
  // istanbul ignore next
  legacyPropNames = [],
  mapper = identity,
) {
  return {
    check: value => checkValidProperty(value, [...propNames, ...legacyPropNames], mapper),
    message: `has unknown properties. Valid properties are:
${propNames.map(propName => `  - ${propName}`).join('\n')}`,
  }
}

const checkValidProperty = function(value, propNames, mapper) {
  return Object.keys(value).every(propName => propNames.includes(mapper(propName)))
}

const deprecatedProperties = function(properties, getExample, mapper) {
  return {
    check(value, key) {
      return findDeprecatedProperty(properties, mapper(key)) === undefined
    },
    message(value, key) {
      const newPropName = findDeprecatedProperty(properties, mapper(key))
      return `is deprecated. It should be renamed to '${newPropName}'.`
    },
    example(value, key, parent) {
      const newPropName = findDeprecatedProperty(properties, mapper(key))
      return getExample(newPropName, key, parent)
    },
  }
}

const findDeprecatedProperty = function(properties, key) {
  const newPropName = properties[key]
  if (newPropName === undefined) {
    return
  }
  return newPropName
}

const identity = function(value) {
  return value
}

// Ensure paths specified by users in the configuration file are not targetting
// files outside the repository root directory.
const isInsideRoot = function(path) {
  return !normalize(path).startsWith('..')
}

const insideRootCheck = {
  check: isInsideRoot,
  message: 'must be inside the root directory.',
}

// Used in examples to show how to fix the above check
const removeParentDots = function(path) {
  return normalize(path).replace(PARENT_DOTS_REGEXP, '')
}

const PARENT_DOTS_REGEXP = /\.\.[/\\]/g

module.exports = { isString, isBoolean, validProperties, deprecatedProperties, insideRootCheck, removeParentDots }
