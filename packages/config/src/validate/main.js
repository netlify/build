const { throwError } = require('../error')

const { getExample } = require('./example')
const {
  PRE_MERGE_VALIDATIONS,
  PRE_CONTEXT_VALIDATIONS,
  PRE_NORMALIZE_VALIDATIONS,
  POST_NORMALIZE_VALIDATIONS,
} = require('./validations')

// Validate the configuration file, before `defaultConfig` merge.
const validatePreMergeConfig = function(config, defaultConfig) {
  validateConfig(config, PRE_MERGE_VALIDATIONS)
  validateConfig(defaultConfig, PRE_MERGE_VALIDATIONS)
}

// Validate the configuration file, before context merge.
const validatePreContextConfig = function(config) {
  validateConfig(config, PRE_CONTEXT_VALIDATIONS)
}

// Validate the configuration file, before normalization.
const validatePreNormalizeConfig = function(config) {
  validateConfig(config, PRE_NORMALIZE_VALIDATIONS)
}

// Validate the configuration file, after normalization.
const validatePostNormalizeConfig = function(config) {
  validateConfig(config, POST_NORMALIZE_VALIDATIONS)
}

const validateConfig = function(config, validations) {
  try {
    validations.forEach(({ property, ...validation }) => {
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
    })
  }

  if (value === undefined || (check !== undefined && check(value))) {
    return
  }

  reportError({ prevPath, propPath, message, example, value, key })
}

const reportError = function({ prevPath, propPath, message, example, value, key }) {
  throwError(`Configuration property ${propPath} ${message}
${getExample({ value, key, prevPath, example })}`)
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

module.exports = {
  validatePreMergeConfig,
  validatePreContextConfig,
  validatePreNormalizeConfig,
  validatePostNormalizeConfig,
}
