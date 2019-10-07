const { promisify } = require('util')

const resolve = require('resolve')

const pResolve = promisify(resolve)

// Require the plugin file and fire its top-level function.
// The returned object is the `logic` which includes all hook methods.
const getLogics = async function({ type, baseDir, pluginConfig }) {
  const pluginPath = await resolvePlugin(type, baseDir)

  const logic = requireLogic(pluginPath)
  const logicA = loadLogic(logic, pluginConfig)

  if (Array.isArray(logicA)) {
    return logicA.flat()
  }

  return [logicA]
}

// We use `resolve` because `require()` should be relative to `baseDir` not to
// this `__filename`
const resolvePlugin = async function(type, baseDir) {
  try {
    return await pResolve(type, { basedir: baseDir })
  } catch (error) {
    // TODO: if plugin not found, automatically try to `npm install` it
    error.message = `'${type}' plugin not installed or found:\n${error.message}`
    throw error
  }
}

const requireLogic = function(pluginPath) {
  try {
    return require(pluginPath)
  } catch (error) {
    error.message = `Error importing plugin:\n${error.message}`
    throw error
  }
}

const loadLogic = function(logic, pluginConfig) {
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

module.exports = { getLogics }
