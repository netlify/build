import { NetlifyConfig } from '../../types/index.js'

export type Mode = 'buildbot' | 'cli' | 'require'

export type BuildCLIFlags = {
  cachedConfig: Record<string, unknown>
  /** Netlify Site ID */
  siteId: string
  /** Netlify API token for authentication */
  token: string
  /**
   * Run in dry mode, i.e. printing steps without executing them
   * @default false
   */
  dry: boolean
  debug?: unknown
  /** Build context */
  context: 'production' | string
  /** The invoking service of netlify build */
  mode: Mode
  telemetry: boolean
  /** Distributed tracing properties for this build*/
  tracing: TracingOptions
  /**
   * Buffer output instead of printing it
   * @default false
   */
  buffer?: boolean
  offline: boolean
  cwd?: string
  /** A list of all the feature flags passed to netlify/build */
  featureFlags: Record<string, boolean>
  /**
   * Print only essential/error output
   * @default false
   */
  quiet?: boolean

  statsd?: { host?: string; port?: number }
}

export type BuildFlags = BuildCLIFlags & {
  env?: Record<string, unknown>
}

export type BuildResult = {
  success: boolean
  severityCode: SeverityCode
  netlifyConfig?: NetlifyConfig
  configMutations?: any
  logs?: string[]
}

export enum SeverityCode {
  success = 1,
  buildCancelled,
  userError,
  pluginError,
  systemError,
}

export type TestOptions = {
  errorMonitor?: any
}

export type ErrorParam = {
  errorMonitor: any
  mode: Mode
  logs: string[]
  debug: any
  testOpts?: TestOptions
  childEnv?: any
  netlifyConfig?: NetlifyConfig
}

export type TracingOptions = {
  enabled: boolean
  httpProtocol: string
  host: string
  port: number
  /** API Key used for a dedicated trace provider */
  apiKey: string
  /** Sample rate being used for this trace, this allows for consistent probability sampling */
  sampleRate: number
  /** Properties of the root span and trace id used to stitch context */
  traceId: string
  traceFlags: number
  parentSpanId: string
  baggageFilePath: string
}
