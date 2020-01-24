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

module.exports = { isString, isBoolean, validProperties, deprecatedProperties }
