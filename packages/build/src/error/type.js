const { getErrorInfo } = require('./info')
const { getBuildCommandLocation, getBuildFailLocation, getApiLocation } = require('./location')

// Retrieve error-type specific information
const getTypeInfo = function(errorProps) {
  const { type } = getErrorInfo(errorProps)

  if (TYPES[type] === undefined) {
    return { type, ...TYPES[DEFAULT_TYPE] }
  }

  return { type, ...TYPES[type] }
}

// List of error types, and their related properties
const TYPES = {
  // User configuration error (`@netlify/config`)
  resolveConfig: {
    header: 'Configuration error',
    context: 'Configuration user error',
    stackType: 'none',
    severity: 'info',
  },

  // User misconfigured a plugin
  pluginInput: {
    header: ({ location: { package, input } }) => `Invalid input "${input}" for plugin "${package}"`,
    context: ({ location: { package, input } }) => `Plugin "${package}" invalid input "${input}"`,
    stackType: 'none',
    getLocation: getBuildFailLocation,
    severity: 'info',
  },

  // `build.command` non-0 exit code
  buildCommand: {
    header: 'Build failed',
    context: ({ location: { buildCommand } }) => buildCommand,
    stackType: 'message',
    getLocation: getBuildCommandLocation,
    severity: 'info',
  },

  // Plugin called `utils.build.failBuild()`
  failBuild: {
    header: 'Build failed',
    context: ({ location: { package } }) => `Plugin "${package}" user error`,
    stackType: 'stack',
    getLocation: getBuildFailLocation,
    severity: 'info',
  },

  // Plugin called `utils.build.failPlugin()`
  failPlugin: {
    header: ({ location: { package } }) => `Plugin "${package}" failed`,
    context: ({ location: { package } }) => `Plugin "${package}" user error`,
    stackType: 'stack',
    getLocation: getBuildFailLocation,
    severity: 'info',
  },

  // Plugin called `utils.build.cancelBuild()`
  cancelBuild: {
    header: ({ location: { package } }) => `Build canceled by ${package}`,
    context: ({ location: { package } }) => `Plugin "${package}" canceled build`,
    stackType: 'stack',
    getLocation: getBuildFailLocation,
    isSuccess: true,
    shouldCancel: true,
    severity: 'info',
  },

  // Plugin has an invalid shape
  pluginValidation: {
    header: ({ location: { package } }) => `Plugin "${package}" internal error`,
    context: ({ location: { package } }) => `Plugin "${package}" internal error`,
    stackType: 'none',
    getLocation: getBuildFailLocation,
    severity: 'warning',
  },

  // Plugin threw an uncaught exception
  pluginInternal: {
    header: ({ location: { package } }) => `Plugin "${package}" internal error`,
    context: ({ location: { package } }) => `Plugin "${package}" internal error`,
    stackType: 'stack',
    showErrorProps: true,
    rawStack: true,
    getLocation: getBuildFailLocation,
    severity: 'warning',
  },

  // Bug while orchestrating child processes
  ipc: {
    header: ({ location: { package } }) => `Plugin "${package}" internal error`,
    context: ({ location: { package } }) => `Plugin "${package}" internal error`,
    stackType: 'none',
    getLocation: getBuildFailLocation,
    severity: 'warning',
  },

  // Error while installing user packages (missing plugins, local plugins or functions dependencies)
  dependencies: {
    header: 'Dependencies error',
    context: 'Packages installation',
    stackType: 'none',
    severity: 'warning',
  },

  // Request error when `@netlify/build` was calling Netlify API
  api: {
    header: 'API error',
    context: ({ location: { endpoint } }) => `API request "${endpoint}"`,
    stackType: 'message',
    showErrorProps: true,
    getLocation: getApiLocation,
    severity: 'error',
  },

  // `@netlify/build` threw an uncaught exception
  internal: {
    header: 'Core internal error',
    context: 'Core internal error',
    stackType: 'stack',
    showErrorProps: true,
    rawStack: true,
    severity: 'error',
  },
}
// When no error type matches, it's an uncaught exception, i.e. a bug
const DEFAULT_TYPE = 'internal'

module.exports = { getTypeInfo }
