// Require the plugin file and fire its top-level function.
// The returned object is the `logic` which includes all event handlers.
const getLogic = function({ pluginPath, inputs, loadedFrom, featureFlags }) {
  const logic = requireLogic(pluginPath)
  const logicA = loadLogic({ logic, inputs })
  const logicB = applyRunCorePluginsLast({ logic: logicA, loadedFrom, featureFlags })
  return logicB
}

const requireLogic = function(pluginPath) {
  try {
    return require(pluginPath)
  } catch (error) {
    error.message = `Could not import plugin:\n${error.message}`
    throw error
  }
}

const loadLogic = function({ logic, inputs }) {
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

const applyRunCorePluginsLast = function({ logic, loadedFrom, featureFlags }) {
  if (featureFlags.runCorePluginsLast || loadedFrom !== 'core' || logic.onBuild === undefined) {
    return logic
  }

  const { onBuild, ...logicA } = logic
  return { ...logicA, onPostBuild: onBuild }
}

module.exports = { getLogic }
