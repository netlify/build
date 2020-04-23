const { throwError } = require('../error')

const { getExample } = require('./example')
const { VALIDATIONS } = require('./validations')

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
      check,
      message,
      example,
      warn,
    })
  }

  if (value === undefined || (check !== undefined && check(value))) {
    return
  }

  reportError({ prevPath, propPath, message, example, warn, value, key })
}

const reportError = function({ prevPath, propPath, message, example, warn, value, key }) {
  const errorMessage = `Configuration property ${propPath} ${message}
${getExample({ value, key, prevPath, example })}`

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

module.exports = { validateConfig }
