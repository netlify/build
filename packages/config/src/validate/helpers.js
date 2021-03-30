'use strict'

const { normalize } = require('path')

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

// Ensure paths specified by users in the configuration file are not targetting
// files outside the repository root directory.
const isInsideRoot = function (path) {
  return !normalize(path).startsWith('..')
}

const insideRootCheck = {
  check: isInsideRoot,
  message: 'must be inside the root directory.',
}

// Used in examples to show how to fix the above check
const removeParentDots = function (path) {
  return normalize(path).replace(PARENT_DOTS_REGEXP, '')
}

const functionsDirectoryCheck = {
  formatInvalid: ({ functionsDirectory } = {}) => ({ functions: { directory: functionsDirectory } }),
  propertyName: 'functions.directory',
}

const PARENT_DOTS_REGEXP = /\.\.[/\\]/g

module.exports = {
  isArrayOfObjects,
  isArrayOfStrings,
  isString,
  validProperties,
  insideRootCheck,
  removeParentDots,
  functionsDirectoryCheck,
}
