const { getPluginLoadLocation, getShellCommandLocation, getPluginCommandLocation } = require('./location')

// Retrieve error-type specific information
const getTypeInfo = function(type) {
  if (TYPES[type] === undefined) {
    return TYPES[DEFAULT_TYPE]
  }

  return TYPES[type]
}

// List of error types, and their related properties
const TYPES = {
  resolveConfig: { header: 'Configuration error', stackType: 'none' },
  dependencies: { header: 'Dependencies error', stackType: 'none' },
  pluginLoad: { header: 'Build failed', stackType: 'message', getLocation: getPluginLoadLocation },
  shellCommand: { header: 'Build failed', stackType: 'message', getLocation: getShellCommandLocation },
  pluginCommand: { header: 'Build failed', stackType: 'message', getLocation: getPluginCommandLocation },
  internalError: { header: 'Internal error', stackType: 'stack', showErrorProps: true },
}
// When no error type matches, it's an uncaught exception, i.e. a bug
const DEFAULT_TYPE = 'internalError'

module.exports = { getTypeInfo }
