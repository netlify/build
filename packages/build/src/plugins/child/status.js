const isPlainObj = require('is-plain-obj')

const { ERROR_TYPE_SYM } = require('../error')

// Report status information to the UI
const show = function(runState, showArgs) {
  validateShowArgs(showArgs)
  const { title, summary, text } = showArgs
  runState.status = { state: 'success', title, summary, text }
}

// Validate arguments of `utils.status.show()`
const validateShowArgs = function(showArgs) {
  try {
    if (showArgs === undefined) {
      throw new Error('requires an argument')
    }

    if (!isPlainObj(showArgs)) {
      throw new Error('argument must be a plain object')
    }

    const { title, summary, text, ...otherArgs } = showArgs
    const otherKeys = Object.keys(otherArgs).map(arg => `"${arg}"`)

    if (otherKeys.length !== 0) {
      throw new Error(`must only contain "title", "summary" or "text" properties, not ${otherKeys.join(', ')}`)
    }

    if (summary === undefined) {
      throw new Error('requires specifying a "summary" property')
    }

    Object.entries({ title, summary, text }).forEach(validateStringArg)
  } catch (error) {
    error.message = `utils.status.show() ${error.message}`
    error[ERROR_TYPE_SYM] = 'pluginValidation'
    throw error
  }
}

const validateStringArg = function([key, value]) {
  if (value !== undefined && (typeof value !== 'string' || value.trim() === '')) {
    throw new Error(`"${key}" property must be a non-empty string`)
  }
}

module.exports = { show }
