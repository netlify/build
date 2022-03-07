// Retrieve error-type specific information
export const getTypeInfo = function ({ type }) {
  const typeA = TYPES[type] === undefined ? DEFAULT_TYPE : type
  return { type: typeA, ...TYPES[typeA] }
}

// List of error types, and their related properties
// Related to build error logs:
//  - `showInBuildLog`: `true` when we want this error to show in build logs (defaults to true)
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
// New error types should be added to Bugsnag since we use it for automated
// monitoring (through its Slack integration). The steps in Bugsnag are:
//  - Create a new bookmark. Try to re-use the search filter of an existing
//    bookmark with a similar error type, but only changing the `errorClass`.
//    Make sure to check the box "Share with my team".
//  - Add the `errorClass` to the search filter of either the "All warnings" or
//    "All errors" bookmark depending on whether we should get notified on Slack
//    for new errors of that type. You must use the bookmark menu action "Update
//    with current filters"
const TYPES = {
  // Plugin called `utils.build.cancelBuild()`
  cancelBuild: {
    title: ({ location: { packageName } }) => `Build canceled by ${packageName}`,
    stackType: 'stack',
    locationType: 'buildFail',
    severity: 'none',
  },

  // User configuration error (`@netlify/config`, wrong Node.js version)
  resolveConfig: {
    title: 'Configuration error',
    stackType: 'none',
    severity: 'info',
  },

  // Error while installing user packages (missing plugins, local plugins or functions dependencies)
  dependencies: {
    title: 'Dependencies installation error',
    stackType: 'none',
    severity: 'info',
  },

  // User misconfigured a plugin
  pluginInput: {
    title: ({ location: { packageName, input } }) => `Plugin "${packageName}" invalid input "${input}"`,
    stackType: 'none',
    locationType: 'buildFail',
    severity: 'info',
  },

  // `build.command` non-0 exit code
  buildCommand: {
    title: '"build.command" failed',
    group: ({ location: { buildCommand } }) => buildCommand,
    stackType: 'message',
    locationType: 'buildCommand',
    severity: 'info',
  },

  // User error during Functions bundling
  functionsBundling: {
    title: ({ location: { functionName } }) => `Bundling of Function "${functionName}" failed`,
    stackType: 'none',
    locationType: 'functionsBundling',
    severity: 'info',
  },

  // Plugin called `utils.build.failBuild()`
  failBuild: {
    title: ({ location: { packageName } }) => `Plugin "${packageName}" failed`,
    stackType: 'stack',
    locationType: 'buildFail',
    severity: 'info',
  },

  // Plugin called `utils.build.failPlugin()`
  failPlugin: {
    title: ({ location: { packageName } }) => `Plugin "${packageName}" failed`,
    stackType: 'stack',
    locationType: 'buildFail',
    severity: 'info',
  },

  // Plugin has an invalid shape
  pluginValidation: {
    title: ({ location: { packageName } }) => `Plugin "${packageName}" internal error`,
    stackType: 'stack',
    locationType: 'buildFail',
    severity: 'warning',
  },

  // Plugin threw an uncaught exception
  pluginInternal: {
    title: ({ location: { packageName } }) => `Plugin "${packageName}" internal error`,
    stackType: 'stack',
    showErrorProps: true,
    rawStack: true,
    locationType: 'buildFail',
    severity: 'warning',
  },

  // Bug while orchestrating child processes
  ipc: {
    title: ({ location: { packageName } }) => `Plugin "${packageName}" internal error`,
    stackType: 'none',
    locationType: 'buildFail',
    severity: 'warning',
  },

  // Core plugin internal error
  corePlugin: {
    title: ({ location: { packageName } }) => `Plugin "${packageName}" internal error`,
    stackType: 'stack',
    showErrorProps: true,
    rawStack: true,
    locationType: 'buildFail',
    severity: 'error',
  },

  // Core step internal error
  coreStep: {
    title: ({ location: { coreStepName } }) => `Internal error during "${coreStepName}"`,
    stackType: 'stack',
    showErrorProps: true,
    rawStack: true,
    locationType: 'coreStep',
    severity: 'error',
  },

  // Request error when `@netlify/build` was calling Netlify API
  api: {
    title: ({ location: { endpoint } }) => `API error on "${endpoint}"`,
    stackType: 'message',
    showErrorProps: true,
    locationType: 'api',
    severity: 'error',
  },

  // `@netlify/build` threw an uncaught exception
  exception: {
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
    stackType: 'stack',
    showErrorProps: true,
    rawStack: true,
    severity: 'error',
  },
}

// When no error type matches, it's an uncaught exception, i.e. a bug
const DEFAULT_TYPE = 'exception'
