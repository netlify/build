'use strict'

const isPlainObj = require('is-plain-obj')
const mapObj = require('map-obj')

const { addErrorInfo } = require('../../error/info')

// Report status information to the UI
const show = function (runState, showArgs) {
  validateShowArgs(showArgs)
  const { title, summary, text } = removeEmptyStrings(showArgs)
  runState.status = { state: 'success', title, summary, text }
}

// Validate arguments of `utils.status.show()`
const validateShowArgs = function (showArgs) {
  try {
    validateShowArgsObject(showArgs)
    const { title, summary, text, ...otherArgs } = showArgs
    validateShowArgsKeys(otherArgs)
    Object.entries({ title, summary, text }).forEach(validateStringArg)
    validateShowArgsSummary(summary)
  } catch (error) {
    error.message = `utils.status.show() ${error.message}`
    addErrorInfo(error, { type: 'pluginValidation' })
    throw error
  }
}

const validateShowArgsObject = function (showArgs) {
  if (showArgs === undefined) {
    throw new Error('requires an argument')
  }

  if (!isPlainObj(showArgs)) {
    throw new Error('argument must be a plain object')
  }
}

const validateShowArgsKeys = function (otherArgs) {
  const otherKeys = Object.keys(otherArgs).map((arg) => `"${arg}"`)
  if (otherKeys.length !== 0) {
    throw new Error(`must only contain "title", "summary" or "text" properties, not ${otherKeys.join(', ')}`)
  }
}

const validateStringArg = function ([key, value]) {
  if (value !== undefined && typeof value !== 'string') {
    throw new Error(`"${key}" property must be a string`)
  }
}

const validateShowArgsSummary = function (summary) {
  if (summary === undefined || summary.trim() === '') {
    throw new Error('requires specifying a "summary" property')
  }
}

const removeEmptyStrings = function (showArgs) {
  return mapObj(showArgs, removeEmptyString)
}

const removeEmptyString = function (key, value) {
  if (typeof value === 'string' && value.trim() === '') {
    return [key]
  }

  return [key, value]
}

module.exports = { show }
