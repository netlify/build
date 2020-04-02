const { yellowBright } = require('chalk')

const { getErrorInfo } = require('./info')
const { getShellCommandLocation, getBuildFailLocation, getApiLocation } = require('./location')

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
  pluginInput: {
    header: ({ location: { package, input } }) => `Invalid input "${input}" for plugin "${package}"`,
    stackType: 'none',
    getLocation: getBuildFailLocation,
  },
  shellCommand: { header: 'Build failed', stackType: 'message', getLocation: getShellCommandLocation },
  failBuild: { header: 'Build failed', stackType: 'stack', getLocation: getBuildFailLocation },
  failPlugin: {
    header: ({ location: { package } }) => `Plugin "${package}" failed`,
    stackType: 'stack',
    getLocation: getBuildFailLocation,
  },
  cancelBuild: {
    header: 'Build canceled',
    stackType: 'stack',
    getLocation: getBuildFailLocation,
    color: yellowBright,
    shouldCancel: true,
  },
  ipc: {
    header: ({ location: { package } }) => `Plugin "${package}" internal error`,
    stackType: 'none',
    getLocation: getBuildFailLocation,
  },
  api: { header: 'API error', stackType: 'message', showErrorProps: true, getLocation: getApiLocation },
  pluginValidation: {
    header: ({ location: { package } }) => `Plugin "${package}" internal error`,
    stackType: 'none',
    getLocation: getBuildFailLocation,
  },
  pluginInternalError: {
    header: ({ location: { package } }) => `Plugin "${package}" internal error`,
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
