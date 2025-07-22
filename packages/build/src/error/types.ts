import { type Attributes } from '@opentelemetry/api'

// We override errorProps and title through getTitle and getErrorProps
export type BuildError = Omit<BasicErrorInfo, 'errorProps'> & {
  title: string
  pluginInfo?: string
  locationInfo?: string
  errorProps?: string
}

export type BasicErrorInfo = {
  message: string
  stack: string
  severity: string
  type: ErrorTypes
  errorInfo: ErrorInfo
  errorProps: Record<string, unknown>
  errorMetadata: any
  /**
   * The core step id where the error took place
   */
  stage?: string
  tsConfigInfo?: any
} & ErrorType

/**
 * Error severity groups the errors emitted by build and used to translate to exit code via SEVERITY_MAP
 */
type ErrorSeverity =
  /**
   * build success
   */
  | 'success'
  /**
   * not an error, e.g. build cancellation
   */
  | 'none'
  /**
   * user error
   */
  | 'info'
  /**
   * community plugin error
   */
  | 'warning'
  /**
   * system error, including core plugin error
   */
  | 'error'

/**
 * How the stack trace should appear in the build error logs
 */
type StackType =
  /**
   * not printed
   */
  | 'none'
  /*
   * printed as is
   */
  | 'stack'
  /**
   * printed as is, but taken from `error.message`. Used when `error.stack` is not being correct due to the error being passed between different processes.
   */
  | 'message'

type GroupFunction = ({ location }: { location: ErrorLocation }) => string
export type TitleFunction = ({ location }: { location: ErrorLocation }) => string

export type ErrorInfo = {
  plugin?: PluginInfo
  tsConfig?: any
  location: ErrorLocation
}

type PluginInfo = {
  packageName: string
  pluginPackageJson: {
    version?: string
  }
  extensionMetadata?: {
    slug: string
    name: string
    version: string
    has_build: boolean
    has_connector: boolean
    author?: string
  }
}

export type BuildCommandLocation = {
  buildCommand: string
  buildCommandOrigin: string
}

export const isBuildCommandLocation = function (location?: ErrorLocation): location is BuildCommandLocation {
  const buildLocation = location as BuildCommandLocation
  return typeof buildLocation?.buildCommand === 'string' && typeof buildLocation?.buildCommandOrigin === 'string'
}

export type FunctionsBundlingLocation = {
  functionName: string
  functionType: string
}

export const isFunctionsBundlingLocation = function (location?: ErrorLocation): location is FunctionsBundlingLocation {
  const bundlingLocation = location as FunctionsBundlingLocation
  return typeof bundlingLocation?.functionName === 'string' && typeof bundlingLocation?.functionType === 'string'
}

export type CoreStepLocation = {
  coreStepName: string
}

export const isCoreStepLocation = function (location?: ErrorLocation): location is CoreStepLocation {
  return typeof (location as CoreStepLocation)?.coreStepName === 'string'
}

export type PluginLocation = {
  event: string
  packageName: string
  loadedFrom: string
  origin: string
  input?: string
}

export const isPluginLocation = function (location?: ErrorLocation): location is PluginLocation {
  const pluginLocation = location as PluginLocation
  return (
    typeof pluginLocation?.event === 'string' &&
    typeof pluginLocation?.packageName === 'string' &&
    typeof pluginLocation?.loadedFrom === 'string'
  )
}

export type APILocation = {
  endpoint: string
  parameters?: any
}

export const isAPILocation = function (location?: ErrorLocation): location is APILocation {
  return typeof (location as APILocation)?.endpoint === 'string'
}

export type DeployLocation = {
  statusCode: string
}

export const isDeployLocation = function (location?: ErrorLocation): location is DeployLocation {
  return typeof (location as DeployLocation)?.statusCode === 'string'
}

export type ErrorLocation =
  | BuildCommandLocation
  | FunctionsBundlingLocation
  | CoreStepLocation
  | PluginLocation
  | APILocation
  | DeployLocation

const buildErrorAttributePrefix = 'build.error'

const errorLocationToTracingAttributes = function (location: ErrorLocation): Attributes {
  const locationAttributePrefix = `${buildErrorAttributePrefix}.location`
  if (isBuildCommandLocation(location)) {
    return {
      [`${locationAttributePrefix}.command`]: location.buildCommand,
      [`${locationAttributePrefix}.command_origin`]: location.buildCommandOrigin,
    }
  }
  if (isPluginLocation(location)) {
    return {
      [`${locationAttributePrefix}.plugin.event`]: location.event,
      [`${locationAttributePrefix}.plugin.package_name`]: location.packageName,
      [`${locationAttributePrefix}.plugin.loaded_from`]: location.loadedFrom,
      [`${locationAttributePrefix}.plugin.origin`]: location.origin,
    }
  }
  if (isFunctionsBundlingLocation(location)) {
    return {
      [`${locationAttributePrefix}.function.type`]: location.functionType,
      [`${locationAttributePrefix}.function.name`]: location.functionName,
    }
  }

  if (isCoreStepLocation(location)) {
    return {
      [`${locationAttributePrefix}.core_step.name`]: location.coreStepName,
    }
  }

  if (isAPILocation(location)) {
    return {
      [`${locationAttributePrefix}.api.endpoint`]: location.endpoint,
    }
  }

  if (isDeployLocation(location)) {
    return {
      [`${locationAttributePrefix}.deploy.status_code`]: location.statusCode,
    }
  }
  return {}
}

const pluginDataToTracingAttributes = function (pluginInfo?: PluginInfo): Attributes {
  const pluginAttributePrefix = `${buildErrorAttributePrefix}.plugin`
  if (typeof pluginInfo === 'undefined') return {}

  return {
    [`${pluginAttributePrefix}.name`]: pluginInfo?.packageName,
    [`${pluginAttributePrefix}.version`]: pluginInfo?.pluginPackageJson?.version,
    [`${pluginAttributePrefix}.extensionAuthor`]: pluginInfo?.extensionMetadata?.author,
    [`${pluginAttributePrefix}.extensionSlug`]: pluginInfo?.extensionMetadata?.slug,
  }
}

/**
 * Given a BuildError, extract the relevant trace attributes to add to the on-going Span
 */
export const buildErrorToTracingAttributes = function (error: BuildError | BasicErrorInfo): Attributes {
  const attributes = {}
  // Check we're not adding undefined values
  if (error?.severity) attributes[`${buildErrorAttributePrefix}.severity`] = error.severity
  if (error?.type) attributes[`${buildErrorAttributePrefix}.type`] = error.type
  if (error?.locationType) attributes[`${buildErrorAttributePrefix}.location.type`] = error.locationType
  if (error?.stage) attributes[`${buildErrorAttributePrefix}.step.id`] = error.stage
  return {
    ...attributes,
    ...errorLocationToTracingAttributes(error.errorInfo?.location),
    ...pluginDataToTracingAttributes(error.errorInfo?.plugin),
  }
}

/**
 * Retrieve error-type specific information
 */
export const getTypeInfo = function ({ type }) {
  const typeA = TYPES[type] === undefined ? DEFAULT_TYPE : type
  return { type: typeA, ...TYPES[typeA] }
}

/**
 * Interface for build error types
 */
export interface ErrorType {
  /**
   *  main title shown in build error logs and in the UI (statuses)
   */
  title: TitleFunction | string
  /**
   *  retrieve a human-friendly location of the error, printed
   */
  locationType?: string
  /**
   *  `true` when the `Error` instance static properties
   */
  showErrorProps?: boolean
  /**
   *  `true` when the stack trace should be cleaned up
   */
  rawStack?: boolean
  /**
   *  `true` when we want this error to show in build logs (defaults to true)
   */
  showInBuildLog?: boolean
  /**
   *  main title shown in Bugsnag. Also used to group errors together in Bugsnag, combined with `error.message`. Defaults to `title`.
   */
  group?: GroupFunction
  /**
   *  error severity (also used by Bugsnag)
   */
  severity: ErrorSeverity
  /**
   *  how the stack trace should appear in build error logs
   */
  stackType: StackType
}

type ErrorTypeMap =
  /**
   * Plugin called `utils.build.cancelBuild()`
   */
  | 'cancelBuild'
  | 'resolveConfig'
  | 'dependencies'
  | 'pluginInput'
  | 'pluginUnsupportedVersion'
  | 'buildCommand'
  | 'functionsBundling'
  | 'secretScanningFoundSecrets'
  | 'failPlugin'
  | 'failBuild'
  | 'pluginValidation'
  | 'pluginInternal'
  | 'ipc'
  | 'corePlugin'
  | 'trustedPlugin'
  | 'coreStep'
  | 'api'
  | 'deploy'
  | 'deployInternal'
  | 'exception'
  | 'telemetry'

/* Error classes for build executions */
export type ErrorTypes = ErrorTypeMap

/**
 * List of error types, and their related properties
 * New error types should be added to Bugsnag since we use it for automated
 * monitoring (through its Slack integration). The steps in Bugsnag are:
 *  - Create a new bookmark. Try to re-use the search filter of an existing
 *    bookmark with a similar error type, but only changing the `errorClass`.
 *    Make sure to check the box "Share with my team".
 *  - Add the `errorClass` to the search filter of either the "All warnings" or
 *    "All errors" bookmark depending on whether we should get notified on Slack
 *    for new errors of that type. You must use the bookmark menu action "Update
 *    with current filters"
 *
 */
const TYPES: { [T in ErrorTypes]: ErrorType } = {
  /**
   * Plugin called `utils.build.cancelBuild()`
   */
  cancelBuild: {
    title: ({ location: { packageName } }: { location: PluginLocation }) => `Build canceled by ${packageName}`,
    stackType: 'stack',
    locationType: 'buildFail',
    severity: 'none',
  },
  /**
   * User configuration error (`@netlify/config`, wrong Node.js version)
   */
  resolveConfig: {
    title: 'Configuration error',
    stackType: 'none',
    severity: 'info',
  },
  /**
   * Error while installing user packages (missing plugins, local plugins or functions dependencies)
   */
  dependencies: {
    title: 'Dependencies installation error',
    stackType: 'none',
    severity: 'info',
  },
  /**
   * User misconfigured a plugin
   */
  pluginInput: {
    title: ({ location: { packageName, input } }: { location: PluginLocation }) =>
      `Plugin "${packageName}" invalid input "${input}"`,
    stackType: 'none',
    locationType: 'buildFail',
    severity: 'info',
  },
  /**
   * User package.json sets an unsupported plugin version
   */
  pluginUnsupportedVersion: {
    title: 'Unsupported plugin version detected',
    stackType: 'none',
    severity: 'info',
  },
  /**
   * `build.command` non-0 exit code
   */
  buildCommand: {
    title: '"build.command" failed',
    group: ({ location: { buildCommand } }: { location: BuildCommandLocation }) => buildCommand,
    stackType: 'message',
    locationType: 'buildCommand',
    severity: 'info',
  },
  /**
   * User error during Functions bundling
   */
  functionsBundling: {
    title: ({ location: { functionName, functionType } }: { location: FunctionsBundlingLocation }) => {
      if (functionType === 'edge') {
        return 'Bundling of edge function failed'
      }

      return `Bundling of function "${functionName}" failed`
    },
    group: ({ location: { functionType = 'serverless' } }: { location: FunctionsBundlingLocation }) =>
      `Bundling of ${functionType} function failed`,
    stackType: 'none',
    locationType: 'functionsBundling',
    severity: 'info',
  },
  /**
   * Error from the secret scanning core step
   */
  secretScanningFoundSecrets: {
    title: 'Secrets scanning detected secrets in files during build.',
    stackType: 'none',
    severity: 'info',
  },
  /**
   * Plugin called `utils.build.failBuild()`
   */
  failBuild: {
    title: ({ location: { packageName } }: { location: PluginLocation }) => `Plugin "${packageName}" failed`,
    stackType: 'stack',
    locationType: 'buildFail',
    severity: 'info',
  },
  /**
   * Plugin called `utils.build.failPlugin()`
   */
  failPlugin: {
    title: ({ location: { packageName } }: { location: PluginLocation }) => `Plugin "${packageName}" failed`,
    stackType: 'stack',
    locationType: 'buildFail',
    severity: 'info',
  },
  /**
   * Plugin has an invalid shape
   */
  pluginValidation: {
    title: ({ location: { packageName } }: { location: PluginLocation }) => `Plugin "${packageName}" internal error`,
    stackType: 'stack',
    locationType: 'buildFail',
    severity: 'warning',
  },
  /**
   * Plugin threw an uncaught exception
   */
  pluginInternal: {
    title: ({ location: { packageName } }: { location: PluginLocation }) => `Plugin "${packageName}" internal error`,
    stackType: 'stack',
    showErrorProps: true,
    rawStack: true,
    locationType: 'buildFail',
    severity: 'warning',
  },
  /**
   * Bug while orchestrating child processes
   */
  ipc: {
    title: ({ location: { packageName } }: { location: PluginLocation }) => `Plugin "${packageName}" internal error`,
    stackType: 'none',
    locationType: 'buildFail',
    severity: 'warning',
  },
  /**
   * Core plugin internal error
   */
  corePlugin: {
    title: ({ location: { packageName } }: { location: PluginLocation }) => `Plugin "${packageName}" internal error`,
    stackType: 'stack',
    showErrorProps: true,
    rawStack: true,
    locationType: 'buildFail',
    severity: 'error',
  },
  /**
   * Trusted plugin internal error (all of our `@netlify/*` plugins).
   */
  trustedPlugin: {
    title: ({ location: { packageName } }: { location: PluginLocation }) => `Plugin "${packageName}" internal error`,
    stackType: 'stack',
    showErrorProps: true,
    rawStack: true,
    locationType: 'buildFail',
    severity: 'error',
  },
  /**
   * Core step internal error
   */
  coreStep: {
    title: ({ location: { coreStepName } }: { location: CoreStepLocation }) =>
      `Internal error during "${coreStepName}"`,
    stackType: 'stack',
    showErrorProps: true,
    rawStack: true,
    locationType: 'coreStep',
    severity: 'error',
  },
  /**
   * Request error when `@netlify/build` was calling Netlify API
   */
  api: {
    title: ({ location: { endpoint } }: { location: APILocation }) => `API error on "${endpoint}"`,
    stackType: 'message',
    showErrorProps: true,
    locationType: 'api',
    severity: 'error',
  },
  /**
   * Non-internal errors deploying files or functions
   */
  deploy: {
    title: 'Error deploying',
    stackType: 'none',
    locationType: 'deploy',
    severity: 'info',
  },
  /**
   * Internal errors deploying files or functions
   */
  deployInternal: {
    title: 'Internal error deploying',
    stackType: 'none',
    locationType: 'deploy',
    severity: 'error',
  },
  /**
   * `@netlify/build` threw an uncaught exception
   */
  exception: {
    title: 'Core internal error',
    stackType: 'stack',
    showErrorProps: true,
    rawStack: true,
    severity: 'error',
  },
  /**
   * Errors related with the telemetry output
   */
  telemetry: {
    showInBuildLog: false,
    title: 'Telemetry error',
    stackType: 'stack',
    showErrorProps: true,
    rawStack: true,
    severity: 'error',
  },
} as const

// When no error type matches, it's an uncaught exception, i.e. a bug
const DEFAULT_TYPE = 'exception'
