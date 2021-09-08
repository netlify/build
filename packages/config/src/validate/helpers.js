'use strict'

const isPlainObj = require('is-plain-obj')

const isArrayOfObjects = function (value) {
  return Array.isArray(value) && value.every(isPlainObj)
}

const isArrayOfStrings = function (value) {
  return Array.isArray(value) && value.every(isString)
}

const isString = function (value) {
  return typeof value === 'string'
}

// Check an object valid properties, including legacy ones
const validProperties = function (propNames, legacyPropNames) {
  return {
    check: (value) => checkValidProperty(value, [...propNames, ...legacyPropNames]),
    message: `has unknown properties. Valid properties are:
${propNames.map((propName) => `  - ${propName}`).join('\n')}`,
  }
}

const checkValidProperty = function (value, propNames) {
  return Object.keys(value).every((propName) => propNames.includes(propName))
}

const functionsDirectoryCheck = {
  formatInvalid: ({ functionsDirectory } = {}) => ({ functions: { directory: functionsDirectory } }),
  propertyName: 'functions.directory',
}

module.exports = {
  isArrayOfObjects,
  isArrayOfStrings,
  isString,
  validProperties,
  functionsDirectoryCheck,
}
