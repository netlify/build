const indentString = require('indent-string')
const isPlainObj = require('is-plain-obj')
const { dump, JSON_SCHEMA } = require('js-yaml')

const { VALIDATIONS } = require('./validations')

// Validate the configuration file.
// Performed before normalization.
const validateConfig = function(config) {
  try {
    VALIDATIONS.forEach(({ property, ...validation }) => {
      const propertyA = property.split('.')
      validateProperty(config, { ...validation, property: propertyA })
    })
  } catch (error) {
    error.cleanStack = true
    throw error
  }
}

// Validate a single property in the configuration file.
const validateProperty = function(
  parent,
  { property: [propName, nextPropName, ...property], propPath = propName, required, check, message, example },
) {
  const value = parent[propName]

  if (nextPropName !== undefined) {
    return validateChild({ value, nextPropName, property, propPath, required, check, message, example })
  }

  if (value === undefined) {
    return checkRequired({ value, required, propPath, example })
  }

  if (check !== undefined && check(value, parent)) {
    return
  }

  throw new Error(`Configuration property '${propPath}' ${message}
${getExample(value, example)}`)
}

// Recurse over children (each part of the `property` array).
// Can use * to recurse over array|object elements.
const validateChild = function({ value, nextPropName, property, propPath, example, ...rest }) {
  if (value === undefined) {
    return
  }

  if (nextPropName !== '*') {
    return validateProperty(value, {
      property: [nextPropName, ...property],
      propPath: `${propPath}.${nextPropName}`,
      example,
      ...rest,
    })
  }

  if (!Array.isArray(value) && !isPlainObj(value)) {
    throw new Error(`Configuration property '${propPath}' must be an array or a plain object.
${getExample(value, example)}`)
  }

  return Object.keys(value).forEach(childProp => {
    const propPathA = Array.isArray(value) ? `${propPath}[${childProp}]` : `${propPath}.${childProp}`
    const childPropA = Array.isArray(value) ? Number(childProp) : childProp
    validateProperty(value, {
      property: [childPropA, ...property],
      propPath: propPathA,
      example,
      ...rest,
    })
  })
}

// When `required` is `true`, property must be defined, unless its parent is
// `undefined`. To make parent required, set its `required` to `true` as well.
const checkRequired = function({ value, required, propPath, example }) {
  if (!required) {
    return
  }

  throw new Error(`Configuration property '${propPath}' is required.
${getExample(value, example)}`)
}

const getExample = function(value, example) {
  return `
Invalid value:

${indentString(serializeValue(value), 2)}

Example 'netlify.yml':
${indentString(example, 2)}`
}

const serializeValue = function(value) {
  if (value === undefined) {
    return String(value)
  }

  return dump(value, { schema: JSON_SCHEMA, noRefs: true }).trim()
}

module.exports = { validateConfig }
