import { throwUserError } from '../error.js'
import { THEME } from '../log/theme.js'

import { getExample } from './example.js'
import {
  PRE_CASE_NORMALIZE_VALIDATIONS,
  PRE_MERGE_VALIDATIONS,
  PRE_CONTEXT_VALIDATIONS,
  PRE_NORMALIZE_VALIDATIONS,
  POST_NORMALIZE_VALIDATIONS,
} from './validations.js'

// Validate the configuration file, before case normalization.
export const validatePreCaseNormalize = function (config) {
  validateConfig(config, PRE_CASE_NORMALIZE_VALIDATIONS)
}

// Validate the configuration file, before `defaultConfig` merge.
export const validatePreMergeConfig = function (config) {
  validateConfig(config, PRE_MERGE_VALIDATIONS)
}

// Validate the configuration file, before context merge.
export const validatePreContextConfig = function (config) {
  validateConfig(config, PRE_CONTEXT_VALIDATIONS)
}

// Validate the configuration file, before normalization.
export const validatePreNormalizeConfig = function (config) {
  validateConfig(config, PRE_NORMALIZE_VALIDATIONS)
}

// Validate the configuration file, after normalization.
export const validatePostNormalizeConfig = function (config) {
  validateConfig(config, POST_NORMALIZE_VALIDATIONS)
}

const validateConfig = function (config, validations) {
  try {
    validations.forEach(({ property, ...validation }) => {
      validateProperty(config, { ...validation, nextPath: property.split('.') })
    })
  } catch (error) {
    throwUserError(error)
  }
}

// Validate a single property in the configuration file.
const validateProperty = function (
  parent,
  {
    nextPath: [propName, nextPropName, ...nextPath],
    prevPath = [propName],
    propPath = propName,
    key = propName,
    check,
    message,
    example,
    formatInvalid,
    propertyName,
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
      formatInvalid,
      propertyName,
    })
  }

  if (value === undefined || (check !== undefined && check(value, key, prevPath))) {
    return
  }

  reportError({ prevPath, propPath, message, example, value, key, formatInvalid, propertyName })
}

const reportError = function ({
  prevPath,
  propPath,
  message,
  example,
  value,
  key,
  formatInvalid,
  propertyName = propPath,
}) {
  throwUserError(`${THEME.highlightWords('Configuration property')} ${propertyName} ${message}
${getExample({ value, key, prevPath, example, formatInvalid })}`)
}

// Recurse over children (each part of the `property` array).
const validateChild = function ({ value, nextPropName, prevPath, nextPath, propPath, ...rest }) {
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

  return Object.keys(value).forEach((childProp) => {
    validateChildProp({ childProp, value, nextPath, propPath, prevPath, ...rest })
  })
}

// Can use * to recurse over array|object elements.
const validateChildProp = function ({ childProp, value, nextPath, propPath, prevPath, ...rest }) {
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
