const { getErrorInfo } = require('./info')
const { getBuildCommandLocation, getBuildFailLocation, getApiLocation } = require('./location')

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
  // User configuration error (`@netlify/config`)
  resolveConfig: {
    header: 'Configuration error',
    stackType: 'none',
  },

  // User misconfigured a plugin
  pluginInput: {
    header: ({ location: { package, input } }) => `Invalid input "${input}" for plugin "${package}"`,
    stackType: 'none',
    getLocation: getBuildFailLocation,
  },

  // `build.command` non-0 exit code
  buildCommand: {
    header: 'Build failed',
    stackType: 'message',
    getLocation: getBuildCommandLocation,
  },

  // Plugin called `utils.build.failBuild()`
  failBuild: {
    header: 'Build failed',
    stackType: 'stack',
    getLocation: getBuildFailLocation,
  },

  // Plugin called `utils.build.failPlugin()`
  failPlugin: {
    header: ({ location: { package } }) => `Plugin "${package}" failed`,
    stackType: 'stack',
    getLocation: getBuildFailLocation,
  },

  // Plugin called `utils.build.cancelBuild()`
  cancelBuild: {
    header: ({ location: { package } }) => `Build canceled by ${package}`,
    stackType: 'stack',
    getLocation: getBuildFailLocation,
    isSuccess: true,
    shouldCancel: true,
  },

  // Plugin has an invalid shape
  pluginValidation: {
    header: ({ location: { package } }) => `Plugin "${package}" internal error`,
    stackType: 'none',
    getLocation: getBuildFailLocation,
  },

  // Plugin threw an uncaught exception
  pluginInternalError: {
    header: ({ location: { package } }) => `Plugin "${package}" internal error`,
    stackType: 'stack',
    showErrorProps: true,
    rawStack: true,
    getLocation: getBuildFailLocation,
  },

  // Bug while orchestrating child processes
  ipc: {
    header: ({ location: { package } }) => `Plugin "${package}" internal error`,
    stackType: 'none',
    getLocation: getBuildFailLocation,
  },

  // Request error when `@netlify/build` was calling Netlify API
  api: {
    header: 'API error',
    stackType: 'message',
    showErrorProps: true,
    getLocation: getApiLocation,
  },

  // Error while installing user packages (missing plugins, local plugins or functions dependencies)
  dependencies: {
    header: 'Dependencies error',
    stackType: 'none',
  },

  // `@netlify/build` threw an uncaught exception
  internalError: {
    header: 'Core internal error',
    stackType: 'stack',
    showErrorProps: true,
    rawStack: true,
  },
}
// When no error type matches, it's an uncaught exception, i.e. a bug
const DEFAULT_TYPE = 'internalError'

module.exports = { getTypeInfo }
