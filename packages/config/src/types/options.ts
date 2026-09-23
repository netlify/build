import type { PartialNetlifyConfig } from './config.js'
import type { ConfigMutation } from './mutations.js'
import type { Config } from './result.js'

/** Where `@netlify/config` is running. */
export type ModeOption = 'buildbot' | 'cli' | 'require'

/** Hooks for tests, including those of other packages. */
export interface TestOptions {
  /** Treat the run as if there were no API client, even with a token. */
  env?: boolean
  /** Send Netlify API and extension API requests to this host instead. */
  host?: string
  /** Scheme to use with `host`. */
  scheme?: string
  [key: string]: unknown
}

/** The options accepted by `resolveConfig`. All of them are optional. */
export interface ResolveConfigOptions {
  /** Path to the configuration file, relative to `cwd`. */
  config?: string
  /** Default configuration values, such as the UI build settings. Lowest priority. */
  defaultConfig?: PartialNetlifyConfig
  /** Configuration overriding every other source. */
  inlineConfig?: PartialNetlifyConfig
  /** A previous result of `resolveConfig` to reuse instead of resolving again. */
  cachedConfig?: Config
  /** Path to a JSON file holding a previous result of `resolveConfig`. */
  cachedConfigPath?: string
  /** Changes to apply on top of `inlineConfig`. */
  configMutations?: ConfigMutation[]
  /** Where `configMutations` come from, for error messages. */
  configMutationsOrigin?: string
  cwd?: string
  /** Path of the package to build, relative to the repository root, in a monorepo. */
  packagePath?: string
  repositoryRoot?: string
  /** Base directory override, relative to the repository root. */
  base?: string
  /** Resolve file paths relative to the base directory rather than the repository root. Defaults to true. */
  baseRelDir?: boolean
  branch?: string
  context?: string
  siteId?: string
  accountId?: string
  deployId?: string
  buildId?: string
  skewProtectionToken?: string
  token?: string
  /** Netlify API host. */
  host?: string
  /** Netlify API scheme. */
  scheme?: string
  /** Netlify API path prefix. */
  pathPrefix?: string
  /** Prefix of the site feature flags to request from the Netlify API. */
  siteFeatureFlagPrefix?: string
  mode?: ModeOption
  /** Do not call the Netlify API. */
  offline?: boolean
  debug?: boolean
  /** Return logs in the result instead of printing them. */
  buffer?: boolean
  /** Environment variables, merged over `process.env` to compute defaults. */
  env?: Record<string, string | undefined>
  featureFlags?: Record<string, unknown>
  testOpts?: TestOptions
}
