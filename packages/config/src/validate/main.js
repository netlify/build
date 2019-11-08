const { VALIDATIONS } = require('./validations')
const { getExample } = require('./example')

// Validate the configuration file.
// Performed before normalization.
const validateConfig = function(config) {
  try {
    VALIDATIONS.forEach(({ property, ...validation }) => {
      validateProperty(config, { ...validation, property: property.split('.') })
    })
  } catch (error) {
    error.cleanStack = true
    throw error
  }
}

// Validate a single property in the configuration file.
const validateProperty = function(
  parent,
  {
    property: [propName, nextPropName, ...property],
    propPath = propName,
    valuePath = [propName],
    required,
    check,
    message,
    example,
  },
) {
  const value = parent[propName]

  if (nextPropName !== undefined) {
    return validateChild({ value, nextPropName, property, propPath, valuePath, required, check, message, example })
  }

  if (value === undefined) {
    return checkRequired({ value, required, propPath, valuePath, example })
  }

  if (check !== undefined && check(value, parent)) {
    return
  }

  throw new Error(`Configuration property '${propPath}' ${message}
${getExample({ value, valuePath, example })}`)
}

// Recurse over children (each part of the `property` array).
const validateChild = function({ value, nextPropName, property, propPath, valuePath, ...rest }) {
  if (value === undefined) {
    return
  }

  if (nextPropName !== '*') {
    return validateProperty(value, {
      property: [nextPropName, ...property],
      propPath: `${propPath}.${nextPropName}`,
      valuePath: [...valuePath, nextPropName],
      ...rest,
    })
  }

  return Object.keys(value).forEach(childProp =>
    validateChildProp({ childProp, value, property, propPath, valuePath, ...rest }),
  )
}

// Can use * to recurse over array|object elements.
const validateChildProp = function({ childProp, value, property, propPath, valuePath, ...rest }) {
  if (Array.isArray(value)) {
    return validateProperty(value, {
      valuePath: [...valuePath, Number(childProp)],
      property: [Number(childProp), ...property],
      propPath: `${propPath}[${childProp}]`,
      ...rest,
    })
  }

  validateProperty(value, {
    valuePath: [...valuePath, childProp],
    property: [childProp, ...property],
    propPath: `${propPath}.${childProp}`,
    ...rest,
  })
}

// When `required` is `true`, property must be defined, unless its parent is
// `undefined`. To make parent required, set its `required` to `true` as well.
const checkRequired = function({ value, required, propPath, valuePath, example }) {
  if (!required) {
    return
  }

  throw new Error(`Configuration property '${propPath}' is required.
${getExample({ value, valuePath, example })}`)
}

module.exports = { validateConfig }
