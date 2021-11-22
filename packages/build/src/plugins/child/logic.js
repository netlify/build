'use strict'

const { addTsErrorInfo } = require('./typescript')

// Require the plugin file and fire its top-level function.
// The returned object is the `logic` which includes all event handlers.
const getLogic = function ({ pluginPath, inputs, tsNodeService }) {
  const logic = requireLogic(pluginPath, tsNodeService)
  const logicA = loadLogic({ logic, inputs })
  return logicA
}

const requireLogic = function (pluginPath, tsNodeService) {
  try {
    // eslint-disable-next-line node/global-require, import/no-dynamic-require
    return require(pluginPath)
  } catch (error) {
    addTsErrorInfo(error, tsNodeService)
    error.message = `Could not import plugin:\n${error.message}`
    throw error
  }
}

const loadLogic = function ({ logic, inputs }) {
  if (typeof logic !== 'function') {
    return logic
  }

  try {
    return logic(inputs)
  } catch (error) {
    error.message = `Could not load plugin:\n${error.message}`
    throw error
  }
}

module.exports = { getLogic }
