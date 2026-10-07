import type { MinimalHeader } from '@netlify/headers-parser'

/** Where a configuration value came from. */
export type ConfigOrigin = 'ui' | 'config' | 'default' | 'inline'

/** Where `functionsDirectory` came from. `-v1` values are the legacy `build.functions` and default directory. */
export type FunctionsDirectoryOrigin = 'ui' | 'config' | 'config-v1' | 'default' | 'default-v1'

export type NodeBundler = 'esbuild' | 'nft' | 'zisi' | 'none'

export interface FunctionConfig {
  deno_import_map?: string | undefined
  directory?: string | undefined
  external_node_modules?: string[] | undefined
  ignored_node_modules?: string[] | undefined
  included_files?: string[] | undefined
  /** In MB, or a string with a unit such as `"2gb"`. */
  memory?: number | string | undefined
  node_bundler?: NodeBundler | undefined
  region?: string | undefined
  schedule?: string | undefined
  vcpu?: number | undefined
}

export interface EdgeFunctionDeclaration {
  function: string
  path?: string | undefined
  excludedPath?: string | string[] | undefined
  pattern?: string | undefined
  excludedPattern?: string | string[] | undefined
  cache?: 'manual' | 'off' | undefined
  /** HTTP method names, matched case-insensitively. */
  method?: string | string[] | undefined
  header?: Record<string, string | boolean> | undefined
  name?: string | undefined
  /** Set by frameworks and integrations only, never in `netlify.toml`. */
  generator?: string | undefined
}

export interface PluginConfig {
  package: string
  inputs?: Record<string, unknown> | undefined
  pinned_version?: string | undefined
  origin?: ConfigOrigin | undefined
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
  base?: string | undefined
  command?: string | undefined
  commandOrigin?: ConfigOrigin | undefined
  edge_functions?: string | undefined
  /** Values are coerced to strings when computing `env`, so `netlify.toml` may use other scalars. */
  environment?: Record<string, unknown> | undefined
  /** Legacy location of the functions directory. */
  functions?: string | undefined
  ignore?: string | undefined
  processing?: ProcessingConfig | undefined
  publish?: string | undefined
  publishOrigin?: ConfigOrigin | undefined
  services?: Record<string, unknown> | undefined
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
  build?: BuildConfig | undefined
  context?: Record<string, PartialNetlifyConfig> | undefined
  database?: { migrations?: { path?: string } | undefined } | undefined
  dev?: Record<string, unknown> | undefined
  edge_functions?: EdgeFunctionDeclaration[] | undefined
  /** Keys are function names or globs (`*` for all functions), or, before normalization, function config properties. */
  functions?: Record<string, unknown> | undefined
  functionsDirectory?: string | undefined
  functionsDirectoryOrigin?: FunctionsDirectoryOrigin | undefined
  headers?: MinimalHeader[] | undefined
  headersOrigin?: ConfigOrigin | undefined
  images?: ({ remote_images?: string[] } & Record<string, unknown>) | undefined
  integrations?: ConfigExtension[] | undefined
  plugins?: PluginConfig[] | undefined
  redirects?: unknown[] | undefined
  redirectsOrigin?: ConfigOrigin | undefined
  spa_fallback?: boolean | undefined
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
