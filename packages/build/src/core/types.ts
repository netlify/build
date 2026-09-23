import type { Client } from '@bugsnag/js'

import { NetlifyConfig, NetlifyPlugin } from '../index.js'
import type { Logs } from '../log/logger.js'
import type { ConfigMutation } from '../plugins/child/diff.js'

export type Mode = 'buildbot' | 'cli' | 'require'

export type BuildCLIFlags = {
  cachedConfig: Record<string, unknown>
  /** Netlify Site ID */
  siteId: string
  /** Netlify API token for authentication */
  token: string
  /** Netlify Deploy ID */
  deployId: string
  /** Netlify Skew Protection token */
  skewProtectionToken?: string
  /**
   * Run in dry mode, i.e. printing steps without executing them
   * @default false
   */
  dry: boolean
  debug?: boolean
  /** Build context, e.g. `production` */
  context: string
  /** The invoking service of netlify build */
  mode: Mode
  telemetry: boolean
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

  packagePath?: string

  statsd?: { host?: string; port?: number }
}

export type BuildFlags = BuildCLIFlags & {
  env?: Record<string, unknown>
  eventHandlers?: EventHandlers
  /** Custom logger function to capture build output */
  logger?: (message: string) => void
}

type EventHandlers = {
  [K in keyof NetlifyPlugin]:
    | NetlifyPlugin[K]
    | {
        handler: NetlifyPlugin[K]
        description: string
        quiet?: boolean
      }
}

export type BuildResult = {
  success: boolean
  severityCode: SeverityCode
  netlifyConfig?: NetlifyConfig
  configMutations?: ConfigMutation[]
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
  /** Print error monitor events instead of sending them */
  errorMonitor?: boolean
  silentLingeringProcesses?: boolean
  telemetryOrigin?: string
  telemetryTimeout?: number
}

export type ErrorParam = {
  errorMonitor: Client | undefined
  mode: Mode
  logs: Logs | undefined
  debug: boolean | undefined
  testOpts?: TestOptions
  childEnv?: NodeJS.ProcessEnv
  netlifyConfig?: NetlifyConfig
}
