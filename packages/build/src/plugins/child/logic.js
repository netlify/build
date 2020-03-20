// Require the plugin file and fire its top-level function.
// The returned object is the `logic` which includes all event handlers.
const getLogic = function({ pluginPath, inputs, constants }) {
  const logic = requireLogic(pluginPath)
  const logicA = loadLogic({ logic, inputs, constants })
  return logicA
}

const requireLogic = function(pluginPath) {
  try {
    return require(pluginPath)
  } catch (error) {
    error.message = `Could not import plugin:\n${error.message}`
    throw error
  }
}

const loadLogic = function({ logic, inputs, constants }) {
  if (typeof logic !== 'function') {
    return logic
  }

  try {
    return logic(inputs, { constants })
  } catch (error) {
    error.message = `Could not load plugin:\n${error.message}`
    throw error
  }
}

module.exports = { getLogic }
