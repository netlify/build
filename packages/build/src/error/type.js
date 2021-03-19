'use strict'

// Retrieve error-type specific information
const getTypeInfo = function ({ type }) {
  const typeA = TYPES[type] === undefined ? DEFAULT_TYPE : type
  return { type: typeA, ...TYPES[typeA] }
}

// List of error types, and their related properties
// Related to build error logs:
//  - `showInBuildLog`: `true` when we want this error to show in build logs
//  - `title`: main title shown in build error logs and in the UI (statuses)
//  - `locationType`: retrieve a human-friendly location of the error, printed
//    in build error logs
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
//  - `severity`: error severity (also used by Bugsnag):
//      - `success`: build success
//      - `none`: not an error, e.g. build cancellation
//      - `info`: user error
//      - `warning`: community plugin error
//      - `error`: system error, including core plugin error
// Related to Bugsnag:
//  - `group`: main title shown in Bugsnag. Also used to group errors together
//    in Bugsnag, combined with `error.message`.
//    Defaults to `title`.
const TYPES = {
  // Plugin called `utils.build.cancelBuild()`
  cancelBuild: {
    showInBuildLog: true,
    title: ({ location: { packageName } }) => `Build canceled by ${packageName}`,
    stackType: 'stack',
    locationType: 'buildFail',
    severity: 'none',
  },

  // User configuration error (`@netlify/config`, wrong Node.js version)
  resolveConfig: {
    showInBuildLog: true,
    title: 'Configuration error',
    stackType: 'none',
    severity: 'info',
  },

  // Error while installing user packages (missing plugins, local plugins or functions dependencies)
  dependencies: {
    showInBuildLog: true,
    title: 'Dependencies installation error',
    stackType: 'none',
    severity: 'info',
  },

  // User misconfigured a plugin
  pluginInput: {
    showInBuildLog: true,
    title: ({ location: { packageName, input } }) => `Plugin "${packageName}" invalid input "${input}"`,
    stackType: 'none',
    locationType: 'buildFail',
    severity: 'info',
  },

  // `build.command` non-0 exit code
  buildCommand: {
    showInBuildLog: true,
    title: '"build.command" failed',
    group: ({ location: { buildCommand } }) => buildCommand,
    stackType: 'message',
    locationType: 'buildCommand',
    severity: 'info',
  },

  // User error during Functions bundling
  functionsBundling: {
    showInBuildLog: true,
    title: ({ location: { functionName } }) => `Bundling of Function "${functionName}" failed`,
    stackType: 'none',
    locationType: 'functionsBundling',
    severity: 'info',
  },

  // Plugin called `utils.build.failBuild()`
  failBuild: {
    showInBuildLog: true,
    title: ({ location: { packageName } }) => `Plugin "${packageName}" failed`,
    stackType: 'stack',
    locationType: 'buildFail',
    severity: 'info',
  },

  // Plugin called `utils.build.failPlugin()`
  failPlugin: {
    showInBuildLog: true,
    title: ({ location: { packageName } }) => `Plugin "${packageName}" failed`,
    stackType: 'stack',
    locationType: 'buildFail',
    severity: 'info',
  },

  // Plugin has an invalid shape
  pluginValidation: {
    showInBuildLog: true,
    title: ({ location: { packageName } }) => `Plugin "${packageName}" internal error`,
    stackType: 'stack',
    locationType: 'buildFail',
    severity: 'warning',
  },

  // Plugin threw an uncaught exception
  pluginInternal: {
    showInBuildLog: true,
    title: ({ location: { packageName } }) => `Plugin "${packageName}" internal error`,
    stackType: 'stack',
    showErrorProps: true,
    rawStack: true,
    locationType: 'buildFail',
    severity: 'warning',
  },

  // Bug while orchestrating child processes
  ipc: {
    showInBuildLog: true,
    title: ({ location: { packageName } }) => `Plugin "${packageName}" internal error`,
    stackType: 'none',
    locationType: 'buildFail',
    severity: 'warning',
  },

  // Core plugin internal error
  corePlugin: {
    showInBuildLog: true,
    title: ({ location: { packageName } }) => `Plugin "${packageName}" internal error`,
    stackType: 'stack',
    showErrorProps: true,
    rawStack: true,
    locationType: 'buildFail',
    severity: 'error',
  },

  // Core command internal error
  coreCommand: {
    showInBuildLog: true,
    title: ({ location: { coreCommandName } }) => `Internal error during "${coreCommandName}"`,
    stackType: 'stack',
    showErrorProps: true,
    rawStack: true,
    locationType: 'coreCommand',
    severity: 'error',
  },

  // Request error when `@netlify/build` was calling Netlify API
  api: {
    showInBuildLog: true,
    title: ({ location: { endpoint } }) => `API error on "${endpoint}"`,
    stackType: 'message',
    showErrorProps: true,
    locationType: 'api',
    severity: 'error',
  },

  // `@netlify/build` threw an uncaught exception
  exception: {
    showInBuildLog: true,
    title: 'Core internal error',
    stackType: 'stack',
    showErrorProps: true,
    rawStack: true,
    severity: 'error',
  },

  // Errors related with the telemetry output
  telemetry: {
    showInBuildLog: false,
    title: 'Telemetry error',
    severity: 'error',
  },
}

// When no error type matches, it's an uncaught exception, i.e. a bug
const DEFAULT_TYPE = 'exception'

module.exports = { getTypeInfo }
