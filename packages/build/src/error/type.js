const { getErrorInfo } = require('./info')
const { getBuildCommandLocation, getBuildFailLocation, getApiLocation } = require('./location')

// Retrieve error-type specific information
const getTypeInfo = function(errorProps) {
  const { type } = getErrorInfo(errorProps)
  const typeA = TYPES[type] === undefined ? DEFAULT_TYPE : type
  return { type: typeA, ...TYPES[typeA] }
}

// List of error types, and their related properties
// Related to error handling:
//  - `shouldCancel`: `true` when the build should be canceled
// Related to build error logs:
//  - `header`: main title shown in build error logs
//  - `getLocation()`: retrieve a human-friendly location of the error, printed
//    in build error logs
//  - `isSuccess`: `true` when this should not be reported as an error
//  - `showErrorProps`: `true` when the `Error` instance static properties
//    should be printed in build error logs. Only useful when the `Error`
//    instance was not created by us.
//  - `rawStack`: `true` when the stack trace should be cleaned up
//  - `stackType`: how the stack trace should appear in build error logs:
//      - `none`: not printed
//      - `stack`: printed as is
//      - `message`: printed as is, but taken from `error.message`.
//        Used when `error.stack` is not being correct due to the error being
//        passed between different processes.
// Related to Bugsnag:
//  - `context`: main title shown in Bugsnag. Also used to group errors together
//    in Bugsnag, combined with `error.message`.
//  - `severity`: Bugsnag error severity:
//      - `info`: user error
//      - `warning`: plugin author error, or possible system error
//      - `error`: likely system error
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
  exception: {
    header: 'Core internal error',
    context: 'Core internal error',
    stackType: 'stack',
    showErrorProps: true,
    rawStack: true,
    severity: 'error',
  },
}
// When no error type matches, it's an uncaught exception, i.e. a bug
const DEFAULT_TYPE = 'exception'

module.exports = { getTypeInfo }
