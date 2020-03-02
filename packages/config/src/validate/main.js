const { cyan } = require('chalk')

const { throwError } = require('../error')

const { VALIDATIONS } = require('./validations')
const { getExample } = require('./example')

// Validate the configuration file.
// Performed before normalization.
const validateConfig = function(config) {
  try {
    VALIDATIONS.forEach(({ property, ...validation }) => {
      validateProperty(config, { ...validation, nextPath: property.split('.') })
    })
  } catch (error) {
    throwError(error)
  }
}

// Validate a single property in the configuration file.
const validateProperty = function(
  parent,
  {
    nextPath: [propName, nextPropName, ...nextPath],
    prevPath = [propName],
    propPath = propName,
    key = propName,
    required,
    check,
    message,
    example,
    warn,
  },
) {
  const value = parent[propName]

  if (nextPropName !== undefined) {
    return validateChild({
      value,
      nextPropName,
      prevPath,
      nextPath,
      propPath,
      key,
      required,
      check,
      message,
      example,
      warn,
    })
  }

  if (value === undefined) {
    return checkRequired({ value, required, propPath, prevPath, example })
  }

  if (check !== undefined && check(value, key, parent)) {
    return
  }

  reportError({ prevPath, propPath, message, example, warn, value, key, parent })
}

const reportError = function({ prevPath, propPath, message, example, warn, value, key, parent }) {
  const messageA = typeof message === 'function' ? message(value, key, parent) : message
  const errorMessage = `Configuration property ${cyan.bold(propPath)} ${messageA}
${getExample({ value, parent, key, prevPath, example })}`

  if (!warn) {
    throwError(errorMessage)
  }

  console.warn(`${errorMessage}\n`)
}

// Recurse over children (each part of the `property` array).
const validateChild = function({ value, nextPropName, prevPath, nextPath, propPath, ...rest }) {
  if (value === undefined) {
    return
  }

  if (nextPropName !== '*') {
    return validateProperty(value, {
      ...rest,
      prevPath: [...prevPath, nextPropName],
      nextPath: [nextPropName, ...nextPath],
      propPath: `${propPath}.${nextPropName}`,
      key: nextPropName,
    })
  }

  return Object.keys(value).forEach(childProp =>
    validateChildProp({ childProp, value, nextPath, propPath, prevPath, ...rest }),
  )
}

// Can use * to recurse over array|object elements.
const validateChildProp = function({ childProp, value, nextPath, propPath, prevPath, ...rest }) {
  if (Array.isArray(value)) {
    const key = Number(childProp)
    return validateProperty(value, {
      ...rest,
      prevPath: [...prevPath, key],
      nextPath: [key, ...nextPath],
      propPath: `${propPath}[${childProp}]`,
      key,
    })
  }

  validateProperty(value, {
    ...rest,
    prevPath: [...prevPath, childProp],
    nextPath: [childProp, ...nextPath],
    propPath: `${propPath}.${childProp}`,
    key: childProp,
  })
}

// When `required` is `true`, property must be defined, unless its parent is
// `undefined`. To make parent required, set its `required` to `true` as well.
const checkRequired = function({ value, required, propPath, prevPath, example }) {
  // istanbul ignore else
  if (!required) {
    return
  }

  // Not used yet
  // istanbul ignore next
  throwError(`Configuration property ${cyan.bold(propPath)} is required.
${getExample({ value, prevPath, example })}`)
}

module.exports = { validateConfig }
