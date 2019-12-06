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

module.exports = { isString, isBoolean, validProperties }
