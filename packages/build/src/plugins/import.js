const { promisify } = require('util')

const resolve = require('resolve')

const { logLoadPlugin } = require('../log/main')

const pResolve = promisify(resolve)

// Import plugin either by module name or by file path.
const importPlugin = async function(type, pluginConfig, pluginId, baseDir) {
  const plugin = await requirePlugin(type, pluginId, baseDir)

  if (typeof plugin !== 'function') {
    return plugin
  }

  try {
    return plugin(pluginConfig)
  } catch (error) {
    error.message = `Error loading '${pluginId}' plugin:\n${error.message}`
    throw error
  }
}

const requirePlugin = async function(type, pluginId, baseDir) {
  // Default plugins are already loaded.
  if (typeof type !== 'string') {
    return type
  }

  logLoadPlugin(pluginId)

  const modulePath = await resolvePlugin(type, baseDir)

  try {
    return require(modulePath)
  } catch (error) {
    error.message = `Error importing '${pluginId}' plugin:\n${error.message}`
    throw error
  }
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

module.exports = { importPlugin }
