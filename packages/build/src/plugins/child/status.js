import isPlainObj from 'is-plain-obj'
import mapObj from 'map-obj'

import { addErrorInfo } from '../../error/info.js'

// Report status information to the UI
export const show = function (runState, showArgs) {
  validateShowArgs(showArgs)
  const { title, summary, text, extraData } = removeEmptyStrings(showArgs)
  runState.status = { state: 'success', title, summary, text, extraData }
}

// Validate arguments of `utils.status.show()`
const validateShowArgs = function (showArgs) {
  try {
    validateShowArgsObject(showArgs)
    const { title, summary, text, extraData, ...otherArgs } = showArgs
    validateShowArgsKeys(otherArgs)
    Object.entries({ title, summary, text }).forEach(validateStringArg)
    validateShowArgsSummary(summary)
    validateShowArgsExtraData(extraData)
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

const validateShowArgsExtraData = function (extraData) {
  if (extraData !== undefined && Array.isArray(extraData) === false) {
    throw new TypeError('provided extra data must be an array')
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
