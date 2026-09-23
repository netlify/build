import type { MinimalHeader } from '@netlify/headers-parser'

/** Where a configuration value came from. */
export type ConfigOrigin = 'ui' | 'config' | 'default' | 'inline'

/** Where `functionsDirectory` came from. `-v1` values are the legacy `build.functions` and default directory. */
export type FunctionsDirectoryOrigin = 'ui' | 'config' | 'config-v1' | 'default' | 'default-v1'

export type NodeBundler = 'esbuild' | 'nft' | 'zisi' | 'none'

export interface FunctionConfig {
  deno_import_map?: string
  directory?: string
  external_node_modules?: string[]
  ignored_node_modules?: string[]
  included_files?: string[]
  /** In MB, or a string with a unit such as `"2gb"`. */
  memory?: number | string
  node_bundler?: NodeBundler
  region?: string
  schedule?: string
  vcpu?: number
}

export interface EdgeFunctionDeclaration {
  function: string
  path?: string
  excludedPath?: string | string[]
  pattern?: string
  excludedPattern?: string | string[]
  cache?: 'manual' | 'off'
  /** HTTP method names, matched case-insensitively. */
  method?: string | string[]
  header?: Record<string, string | boolean>
  name?: string
  /** Set by frameworks and integrations only, never in `netlify.toml`. */
  generator?: string
}

export interface PluginConfig {
  package: string
  inputs?: Record<string, unknown>
  pinned_version?: string
  origin?: ConfigOrigin
}

export interface ProcessingConfig {
  css?: Record<string, unknown>
  html?: Record<string, unknown>
  images?: Record<string, unknown>
  js?: Record<string, unknown>
  skip_processing?: boolean
  [key: string]: unknown
}

interface BuildProperties {
  base?: string
  command?: string
  commandOrigin?: ConfigOrigin
  edge_functions?: string
  /** Values are coerced to strings when computing `env`, so `netlify.toml` may use other scalars. */
  environment?: Record<string, unknown>
  /** Legacy location of the functions directory. */
  functions?: string
  ignore?: string
  processing?: ProcessingConfig
  publish?: string
  publishOrigin?: ConfigOrigin
  services?: Record<string, unknown>
}

// Known properties are declared separately from the index signature: `Omit` on a type with an
// index signature would turn every known property into `unknown`.
export type BuildConfig = BuildProperties & Record<string, unknown>

export type BuildConfigWithout<Keys extends keyof BuildProperties> = Omit<BuildProperties, Keys> &
  Record<string, unknown>

export interface ConfigExtension {
  name: string
  dev?: { path: string; force_run_in_build?: boolean }
}

interface NetlifyConfigProperties {
  build?: BuildConfig
  context?: Record<string, PartialNetlifyConfig>
  database?: { migrations?: { path?: string } }
  dev?: Record<string, unknown>
  edge_functions?: EdgeFunctionDeclaration[]
  /** Keys are function names or globs (`*` for all functions), or, before normalization, function config properties. */
  functions?: Record<string, unknown>
  functionsDirectory?: string
  functionsDirectoryOrigin?: FunctionsDirectoryOrigin
  headers?: MinimalHeader[]
  headersOrigin?: ConfigOrigin
  images?: { remote_images?: string[] } & Record<string, unknown>
  integrations?: ConfigExtension[]
  plugins?: PluginConfig[]
  redirects?: unknown[]
  redirectsOrigin?: ConfigOrigin
  spa_fallback?: boolean
}

/**
 * A configuration from a single source (`netlify.toml`, UI settings, inline config), or any
 * merge of them, before normalization. Every property is optional, and properties this package
 * doesn't know about are passed through untouched.
 *
 * Values have only been checked by the validations run so far, so code handling this type still
 * treats unvalidated properties defensively.
 */
export type PartialNetlifyConfig = NetlifyConfigProperties & Record<string, unknown>

export type PartialNetlifyConfigWithout<Keys extends keyof NetlifyConfigProperties> = Omit<
  NetlifyConfigProperties,
  Keys
> &
  Record<string, unknown>

export type FunctionsConfig = { '*': FunctionConfig } & Record<string, FunctionConfig>

type NormalizedProperties = Omit<NetlifyConfigProperties, 'build' | 'context' | 'functions' | 'plugins'> & {
  build: BuildConfig & {
    environment: Record<string, unknown>
    publish: string
    publishOrigin: ConfigOrigin
    processing: ProcessingConfig
    services: Record<string, unknown>
  }
  functions: FunctionsConfig
  plugins: (PluginConfig & { inputs: Record<string, unknown> })[]
}

/** A configuration after normalization: defaults filled in, and `functions` keyed by function name or glob only. */
export type NormalizedNetlifyConfig = NormalizedProperties & Record<string, unknown>

/**
 * A redirect as returned by `parseAllRedirects` in `@netlify/redirect-parser` with `minimal: true`,
 * whose normalizer is untyped JS.
 */
export interface Redirect {
  from: string
  to: string
  status?: number
  force: boolean
  query: Record<string, string>
  conditions: Record<string, unknown>
  signed?: string
  headers: Record<string, string>
  rate_limit?: unknown
}

/** The fully resolved configuration returned by `resolveConfig`: paths are absolute and headers and redirects are parsed. */
export type ResolvedNetlifyConfig = Omit<NormalizedProperties, 'headers' | 'redirects'> & {
  headers: MinimalHeader[]
  redirects: Redirect[]
} & Record<string, unknown>
