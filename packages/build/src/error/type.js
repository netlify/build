const { yellowBright } = require('chalk')

const { getShellCommandLocation, getBuildFailLocation } = require('./location')
const { getErrorInfo } = require('./info')

// Retrieve error-type specific information
const getTypeInfo = function(errorProps) {
  const { type } = getErrorInfo(errorProps)

  if (TYPES[type] === undefined) {
    return TYPES[DEFAULT_TYPE]
  }

  return TYPES[type]
}

// List of error types, and their related properties
const TYPES = {
  resolveConfig: { header: 'Configuration error', stackType: 'none' },
  dependencies: { header: 'Dependencies error', stackType: 'none' },
  shellCommand: { header: 'Build failed', stackType: 'message', getLocation: getShellCommandLocation },
  fail: { header: 'Build failed', stackType: 'stack', getLocation: getBuildFailLocation },
  cancel: { header: 'Build canceled', stackType: 'stack', getLocation: getBuildFailLocation, color: yellowBright },
  ipc: { header: 'Plugin internal error', stackType: 'none', getLocation: getBuildFailLocation },
  pluginInternalError: {
    header: 'Plugin internal error',
    stackType: 'stack',
    showErrorProps: true,
    rawStack: true,
    getLocation: getBuildFailLocation,
  },
  internalError: { header: 'Core internal error', stackType: 'stack', showErrorProps: true, rawStack: true },
}
// When no error type matches, it's an uncaught exception, i.e. a bug
const DEFAULT_TYPE = 'internalError'

module.exports = { getTypeInfo }
