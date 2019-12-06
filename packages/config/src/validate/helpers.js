const isString = function(value) {
  return typeof value === 'string'
}

const isBoolean = function(value) {
  return typeof value === 'boolean'
}

const validProperties = function(propNames, legacyPropNames = propNames) {
  return {
    check: value => Object.keys(value).every(propName => [...propNames, ...legacyPropNames].includes(propName)),
    message: `has unknown properties. Valid properties are:
${propNames.map(propName => `  - ${propName}`).join('\n')}`,
  }
}

const deprecatedProperties = function(properties, getExample) {
  return {
    check(value, key) {
      return findDeprecatedProperty(properties, key) === undefined
    },
    message(value, key) {
      const newPropName = findDeprecatedProperty(properties, key)
      return `is deprecated. It should be renamed to '${newPropName}'.`
    },
    example(value, key) {
      const newPropName = findDeprecatedProperty(properties, key)
      return getExample(newPropName)
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

module.exports = { isString, isBoolean, validProperties, deprecatedProperties }
