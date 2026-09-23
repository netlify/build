import { type Attributes } from '@opentelemetry/api'
import type { PackageJson } from 'read-package-up'

import type { PluginStatus } from '../status/add.js'

// We override errorProps and title through getTitle and getErrorProps
export type BuildError = Omit<BasicErrorInfo, 'errorProps'> & {
  title: string
  tsConfigInfo?: string | undefined
  pluginInfo?: string | undefined
  locationInfo?: string | undefined
  errorProps?: string | undefined
}

export type BasicErrorInfo = {
  message: string
  stack: string
  type: ErrorTypes
  errorInfo: ErrorInfo
  errorProps: Record<string, unknown>
  errorMetadata: unknown
  /**
   * The core step id where the error took place
   */
  stage?: string
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

// Error information is not validated, so a type's title or group cannot rely on its location's kind
type GroupFunction = (errorInfo: { location: AnyErrorLocation }) => string | undefined
export type TitleFunction = (errorInfo: { location: AnyErrorLocation }) => string

/**
 * Information added to errors by `addErrorInfo()`, either by us, by dependencies like
 * `@netlify/zip-it-and-ship-it`, or by plugin child processes through IPC
 */
export type ErrorInfo = {
  type?: string | undefined
  location?: ErrorLocation
  plugin?: PluginInfo
  tsConfig?: { compilerOptions?: unknown; tsNodeOptions?: unknown }
  errorMetadata?: unknown
  statuses?: PluginStatus[]
  /**
   * The core step id where the error took place
   */
  stage?: string
  /**
   * Grouping hash used by the error monitor instead of `error.message`
   */
  normalizedMessage?: string
}

type PluginInfo = {
  packageName: string
  pluginPackageJson?: PackageJson | undefined
  extensionMetadata?:
    | {
        slug: string
        name: string
        version: string
        has_build: boolean
        has_connector: boolean
        author?: string
      }
    | undefined
}

export type BuildCommandLocation = {
  buildCommand: string
  buildCommandOrigin: string
  configPath?: string | undefined
}

export const isBuildCommandLocation = function (location?: ErrorLocation): location is BuildCommandLocation {
  const fields: AnyErrorLocation | undefined = location
  return typeof fields?.buildCommand === 'string' && typeof fields.buildCommandOrigin === 'string'
}

// `@netlify/zip-it-and-ship-it` sets `bundler` and `runtime` but not `functionType`
export type FunctionsBundlingLocation = {
  functionName: string
  functionType?: string
  bundler?: string
  runtime?: string
}

export const isFunctionsBundlingLocation = function (location?: ErrorLocation): location is FunctionsBundlingLocation {
  const fields: AnyErrorLocation | undefined = location
  return typeof fields?.functionName === 'string' && typeof fields.functionType === 'string'
}

export type CoreStepLocation = {
  coreStepName: string
}

export const isCoreStepLocation = function (location?: ErrorLocation): location is CoreStepLocation {
  const fields: AnyErrorLocation | undefined = location
  return typeof fields?.coreStepName === 'string'
}

export type PluginLocation = {
  event: string
  packageName: string
  loadedFrom: string
  origin: string
  input?: string | undefined
}

export const isPluginLocation = function (location?: ErrorLocation): location is PluginLocation {
  const fields: AnyErrorLocation | undefined = location
  return (
    typeof fields?.event === 'string' && typeof fields.packageName === 'string' && typeof fields.loadedFrom === 'string'
  )
}

export type APILocation = {
  endpoint: string
  parameters?: unknown
}

export const isAPILocation = function (location?: ErrorLocation): location is APILocation {
  const fields: AnyErrorLocation | undefined = location
  return typeof fields?.endpoint === 'string'
}

export type DeployLocation = {
  statusCode: string
}

export const isDeployLocation = function (location?: ErrorLocation): location is DeployLocation {
  const fields: AnyErrorLocation | undefined = location
  return typeof fields?.statusCode === 'string'
}

export type ErrorLocation =
  | BuildCommandLocation
  | FunctionsBundlingLocation
  | CoreStepLocation
  | PluginLocation
  | APILocation
  | DeployLocation

/**
 * The fields of every kind of location, since nothing checks which kind an error's location is
 */
export type AnyErrorLocation = Partial<
  BuildCommandLocation & FunctionsBundlingLocation & CoreStepLocation & PluginLocation & APILocation & DeployLocation
>

export const hasErrorLocation = function (errorInfo: ErrorInfo): errorInfo is ErrorInfo & { location: ErrorLocation } {
  return errorInfo.location !== undefined
}

const buildErrorAttributePrefix = 'build.error'

const errorLocationToTracingAttributes = function (location: ErrorLocation | undefined): Attributes {
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
    [`${pluginAttributePrefix}.name`]: pluginInfo.packageName,
    [`${pluginAttributePrefix}.version`]: pluginInfo.pluginPackageJson?.version,
    [`${pluginAttributePrefix}.extensionAuthor`]: pluginInfo.extensionMetadata?.author,
    [`${pluginAttributePrefix}.extensionSlug`]: pluginInfo.extensionMetadata?.slug,
  }
}

/**
 * Given a BuildError, extract the relevant trace attributes to add to the on-going Span
 */
export const buildErrorToTracingAttributes = function (error: Partial<BuildError | BasicErrorInfo>): Attributes {
  const attributes: Attributes = {}
  // Check we're not adding undefined values
  if (error.severity) attributes[`${buildErrorAttributePrefix}.severity`] = error.severity
  if (error.type) attributes[`${buildErrorAttributePrefix}.type`] = error.type
  if (error.locationType) attributes[`${buildErrorAttributePrefix}.location.type`] = error.locationType
  if (error.stage) attributes[`${buildErrorAttributePrefix}.step.id`] = error.stage
  return {
    ...attributes,
    ...errorLocationToTracingAttributes(error.errorInfo?.location),
    ...pluginDataToTracingAttributes(error.errorInfo?.plugin),
  }
}

// Like `TYPES[type] !== undefined`, this is also true for `Object.prototype` keys
const isErrorType = function (type: string | undefined): type is ErrorTypes {
  return type !== undefined && type in TYPES
}

/**
 * Retrieve error-type specific information
 */
export const getTypeInfo = function ({ type }: ErrorInfo): ErrorType & { type: ErrorTypes } {
  const typeA = isErrorType(type) ? type : DEFAULT_TYPE
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
  locationType?: string | undefined
  /**
   *  `true` when the `Error` instance static properties
   */
  showErrorProps?: boolean | undefined
  /**
   *  `true` when the stack trace should be cleaned up
   */
  rawStack?: boolean | undefined
  /**
   *  `true` when we want this error to show in build logs (defaults to true)
   */
  showInBuildLog?: boolean | undefined
  /**
   *  main title shown in Bugsnag. Also used to group errors together in Bugsnag, combined with `error.message`. Defaults to `title`.
   */
  group?: GroupFunction | undefined
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
// Fallback when a title cannot be built from the error information
export const DEFAULT_TITLE = 'Core internal error'

const TYPES: Record<ErrorTypes, ErrorType> = {
  /**
   * Plugin called `utils.build.cancelBuild()`
   */
  cancelBuild: {
    title: ({ location: { packageName } }) => `Build canceled by ${String(packageName)}`,
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
    title: ({ location: { packageName, input } }) => `Plugin "${String(packageName)}" invalid input "${String(input)}"`,
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
    group: ({ location: { buildCommand } }) => buildCommand,
    stackType: 'message',
    locationType: 'buildCommand',
    severity: 'info',
  },
  /**
   * User error during Functions bundling
   */
  functionsBundling: {
    title: ({ location: { functionName, functionType } }) => {
      if (functionType === 'edge') {
        return 'Bundling of edge function failed'
      }

      return `Bundling of function "${String(functionName)}" failed`
    },
    group: ({ location: { functionType = 'serverless' } }) => `Bundling of ${functionType} function failed`,
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
    title: ({ location: { packageName } }) => `Plugin "${String(packageName)}" failed`,
    stackType: 'stack',
    locationType: 'buildFail',
    severity: 'info',
  },
  /**
   * Plugin called `utils.build.failPlugin()`
   */
  failPlugin: {
    title: ({ location: { packageName } }) => `Plugin "${String(packageName)}" failed`,
    stackType: 'stack',
    locationType: 'buildFail',
    severity: 'info',
  },
  /**
   * Plugin has an invalid shape
   */
  pluginValidation: {
    title: ({ location: { packageName } }) => `Plugin "${String(packageName)}" internal error`,
    stackType: 'stack',
    locationType: 'buildFail',
    severity: 'warning',
  },
  /**
   * Plugin threw an uncaught exception
   */
  pluginInternal: {
    title: ({ location: { packageName } }) => `Plugin "${String(packageName)}" internal error`,
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
    title: ({ location: { packageName } }) => `Plugin "${String(packageName)}" internal error`,
    stackType: 'none',
    locationType: 'buildFail',
    severity: 'warning',
  },
  /**
   * Core plugin internal error
   */
  corePlugin: {
    title: ({ location: { packageName } }) => `Plugin "${String(packageName)}" internal error`,
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
    title: ({ location: { packageName } }) => `Plugin "${String(packageName)}" internal error`,
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
    title: ({ location: { coreStepName } }) => `Internal error during "${String(coreStepName)}"`,
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
    title: ({ location: { endpoint } }) => `API error on "${String(endpoint)}"`,
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
    title: DEFAULT_TITLE,
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
