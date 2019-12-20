// Require the plugin file and fire its top-level function.
// The returned object is the `logic` which includes all event handlers.
const getLogic = function({ pluginPath, pluginConfig }) {
  const logic = requireLogic(pluginPath)
  const logicA = loadLogic({ logic, pluginConfig })
  return logicA
}

const requireLogic = function(pluginPath) {
  try {
    return require(pluginPath)
  } catch (error) {
    error.message = `Error importing plugin:\n${error.message}`
    throw error
  }
}

const loadLogic = function({ logic, pluginConfig }) {
  if (typeof logic !== 'function') {
    return logic
  }

  try {
    return logic(pluginConfig)
  } catch (error) {
    error.message = `Error loading plugin:\n${error.message}`
    throw error
  }
}

module.exports = { getLogic }
