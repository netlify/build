import type { NetlifyAPI } from '@netlify/api'
import type { MinimalHeader } from '@netlify/headers-parser'

// A type says what has been checked: outside values start as `unknown` or `RawConfig`, typed only
// by the validation rules or, where those don't check a property, by a lenient schema.

/** A configuration object as given by a source (`netlify.toml`, an option), before any check. */
export type RawConfig = Record<string, unknown>

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
  /** A cron expression. The cron parser also accepts falsy values and arrays of predefined names. */
  schedule?: unknown
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
  /** Set by frameworks and extensions only, never in `netlify.toml`. */
  generator?: string | undefined
}

/** Build settings in one source, after case normalization. Only `command` is checked at this stage. */
export type SourceBuild = Record<string, unknown> & { command?: string | undefined }

/** A plugin in one source: an object, whose properties are checked after merging. */
export type SourcePlugin = Record<string, unknown> & { origin?: unknown }

/** A source or one of its context entries, after its own checks, case normalization and origins. */
export type SourceEntry = RawConfig & {
  build: SourceBuild
  plugins?: SourcePlugin[] | undefined
  /** Unchecked in a context entry, where nested contexts are ignored. */
  context?: unknown
}

/** A source, whose context entries are processed. Other properties are checked once sources are merged. */
export type SourceConfig = SourceEntry & { context?: Record<string, SourceEntry> | undefined }

export interface PluginConfig {
  package: string
  inputs: Record<string, unknown>
  pinned_version?: string | undefined
  origin?: ConfigOrigin | undefined
}

// This and `BuildConfig`'s origins, `environment` and `services` are typed by the lenient check
// after normalization, which only warns: no rule checks them.
export type ProcessingConfig = Record<string, unknown> & {
  css: Record<string, unknown>
  html: Record<string, unknown>
  images: Record<string, unknown>
  js: Record<string, unknown>
  skip_processing?: boolean | undefined
}

export type BuildConfig = Record<string, unknown> & {
  base?: string | undefined
  command?: string | undefined
  commandOrigin?: ConfigOrigin | undefined
  edge_functions?: string | undefined
  /** Values are coerced to strings when computing `env`, so `netlify.toml` may use other scalars. */
  environment: Record<string, unknown>
  /** Legacy mirror of `functionsDirectory`. */
  functions?: string | undefined
  ignore?: string | undefined
  processing: ProcessingConfig
  publish: string
  publishOrigin: ConfigOrigin
  services: Record<string, unknown>
}

export type FunctionsConfig = Record<string, FunctionConfig> & { '*': FunctionConfig }

export interface ConfigExtension {
  name: string
  dev?: { path: string; force_run_in_build?: boolean | undefined } | undefined
}

// Declared apart from `RawConfig`'s index signature: `Omit` on a type with one erases known properties.
interface NormalizedProperties {
  build: BuildConfig
  functions: FunctionsConfig
  functionsDirectory?: string | undefined
  functionsDirectoryOrigin?: FunctionsDirectoryOrigin | undefined
  plugins: PluginConfig[]
  edge_functions?: EdgeFunctionDeclaration[] | undefined
  database?: { migrations?: { path?: string | undefined } | undefined } | undefined
  dev?: Record<string, unknown> | undefined
  images?: (Record<string, unknown> & { remote_images?: string[] | undefined }) | undefined
  integrations?: ConfigExtension[] | undefined
  spa_fallback?: boolean | undefined
  headersOrigin?: ConfigOrigin | undefined
  redirectsOrigin?: ConfigOrigin | undefined
}

/**
 * Every source merged, normalized, checked by the rules and typed by the lenient check, which only
 * warns. Unknown properties are passed through from the sources untouched.
 */
export type NormalizedConfig = RawConfig &
  NormalizedProperties & {
    /** As written in the sources, until `@netlify/headers-parser` parses them. */
    headers?: unknown
    /** As written in the sources, until `@netlify/redirect-parser` parses them. */
    redirects?: unknown
  }

/** A redirect as `@netlify/redirect-parser` returns it with `minimal: true`. */
export interface Redirect {
  from: string
  to: string
  status?: number | undefined
  force: boolean
  query: Record<string, string>
  conditions: Record<string, unknown>
  signed?: string | undefined
  headers: Record<string, string>
  rate_limit?: unknown
}

export type Header = MinimalHeader

/** The resolved configuration: paths are absolute, and headers and redirects are parsed. */
export type NetlifyConfig = RawConfig &
  NormalizedProperties & {
    headers: Header[]
    redirects: Redirect[]
  }

/** A change to the configuration made at build time, for example by a build plugin. */
export interface ConfigMutation {
  /** Path to the property, e.g. `['build', 'command']`. Numbers are array indices. */
  keys: (string | number)[]
  value: unknown
  /** The event during which the change was made, e.g. `'onPreBuild'`. */
  event: string
}

/** Called before printing, so output buffered elsewhere (for example by `@netlify/build`) is written first. */
export interface OutputFlusher {
  flush(): void
}

/** Logs collected in memory, with the `buffer` option. Only `stderr` is ever written. */
export interface BufferedLogs {
  stdout: string[]
  stderr: string[]
  outputFlusher?: OutputFlusher | undefined
}

/** Logs printed to stderr as they happen. */
export interface StreamedLogs {
  outputFlusher?: OutputFlusher | undefined
}

export type Logs = BufferedLogs | StreamedLogs

type ApiSite = Awaited<ReturnType<NetlifyAPI['getSite']>>

type ApiBuildSettings = NonNullable<ApiSite['build_settings']> & {
  base?: string
  base_rel_dir?: boolean
}

/**
 * The UI build settings. `base` and `base_rel_dir` are returned by the API but missing from its
 * published types, which also don't say that any setting can be `null`.
 */
export type SiteBuildSettings = { [Key in keyof ApiBuildSettings]?: ApiBuildSettings[Key] | null }

export interface UiPlugin {
  package: string
  inputs?: Record<string, unknown> | undefined
  pinned_version?: string | undefined
}

/** A site as returned by the Netlify API, or the subset known without calling it. */
export type SiteInfo = Partial<Omit<ApiSite, 'build_settings' | 'capabilities' | 'processing_settings'>> & {
  build_settings?: SiteBuildSettings | null | undefined
  /** Passed through as returned: the published types say every value is an object, but some are flags. */
  capabilities?: Record<string, unknown> | undefined
  /** Passed through as returned: the published types only list `html.pretty_urls`. */
  processing_settings?: Record<string, unknown> | undefined
  /** Plugins installed in the UI, missing from the published types. */
  plugins?: UiPlugin[] | undefined
  feature_flags?: Record<string, string | number | boolean> | undefined
  use_envelope?: boolean | undefined
}

/** A user's account. Only `slug` and `site_env` are read here; the rest is passed through. */
export interface Account {
  slug: string
  /** Account-wide environment variables, for accounts that don't use the environment variables API. */
  site_env?: Record<string, string> | undefined
  id?: string | undefined
  name?: string | undefined
  default?: boolean | undefined
  team_logo_url?: string | null | undefined
  on_pro_trial?: boolean | undefined
  organization_id?: string | null | undefined
  type_name?: string | undefined
  type_slug?: string | undefined
  members_count?: number | undefined
}

/** An extension installed on the site, as returned by the extension API. */
export interface Extension {
  author?: string | undefined
  extension_token?: string | undefined
  has_build: boolean
  name: string
  slug: string
  version: string
}

export interface ExtensionBuildPlugin {
  origin: 'local' | 'remote'
  packageURL: URL
}

/** An extension in the result: installed on the site, or under development in `netlify.toml`. */
export interface Integration {
  author: string
  buildPlugin: ExtensionBuildPlugin | null
  dev?: ConfigExtension['dev']
  extension_token: string
  has_build: boolean
  name: string
  slug: string
  version: string
}

/** Where an environment variable was set. Earlier sources take precedence over later ones. */
export type EnvironmentVariableSource = 'configFile' | 'ui' | 'account' | 'general' | 'internal'

export interface EnvironmentVariable {
  /** Every source that sets the variable, highest precedence first. */
  sources: EnvironmentVariableSource[]
  value: string
}

/** Where `@netlify/config` is running. */
export type Mode = 'buildbot' | 'cli' | 'require'

/** Hooks for tests, including those of other packages, which may add their own keys. */
export type TestOptions = Record<string, unknown> & {
  /** Treat the run as if there were no API client, even with a token. */
  env?: boolean | undefined
  /** Send Netlify API and extension API requests to this host instead. */
  host?: string | undefined
  /** Scheme to use with `host`. */
  scheme?: string | undefined
}

export interface ResolveConfigOptions {
  /** Path to the configuration file, relative to `cwd`. */
  config?: string | undefined
  /** Default configuration values, such as the UI build settings. Lowest priority. */
  defaultConfig?: RawConfig | undefined
  /** Configuration overriding every other source. */
  inlineConfig?: RawConfig | undefined
  /** A previous result of `resolveConfig` to reuse instead of resolving again. */
  cachedConfig?: Config | undefined
  /** Path to a JSON file holding a previous result of `resolveConfig`. */
  cachedConfigPath?: string | undefined
  /** Changes to apply on top of `inlineConfig`. */
  configMutations?: ConfigMutation[] | undefined
  /** Where `configMutations` come from, for error messages. */
  configMutationsOrigin?: string | undefined
  cwd?: string | undefined
  /** Path of the package to build, relative to the repository root, in a monorepo. */
  packagePath?: string | undefined
  repositoryRoot?: string | undefined
  /** Base directory override, relative to the repository root. */
  base?: string | undefined
  /** Resolve file paths relative to the base directory rather than the repository root. Defaults to true. */
  baseRelDir?: boolean | undefined
  branch?: string | undefined
  context?: string | undefined
  siteId?: string | undefined
  accountId?: string | undefined
  deployId?: string | undefined
  buildId?: string | undefined
  skewProtectionToken?: string | undefined
  /** `null` counts as absent, like an empty string. */
  token?: string | null | undefined
  /** Netlify API host. */
  host?: string | undefined
  /** Netlify API scheme. */
  scheme?: string | undefined
  /** Netlify API path prefix. */
  pathPrefix?: string | undefined
  /** Prefix of the site feature flags to request from the Netlify API. */
  siteFeatureFlagPrefix?: string | undefined
  mode?: Mode | undefined
  /** Do not call the Netlify API. */
  offline?: boolean | undefined
  debug?: boolean | undefined
  /** Return logs in the result instead of printing them. */
  buffer?: boolean | undefined
  /** Environment variables, merged over `process.env` to compute defaults. */
  env?: Record<string, string | undefined> | undefined
  /** Only tested for truthiness, so site feature flags' string variants are fine. */
  featureFlags?: Record<string, unknown> | undefined
  testOpts?: TestOptions | undefined
}

/** The result of `resolveConfig`. */
export interface Config {
  siteInfo: SiteInfo
  integrations: Integration[]
  accounts: Account[]
  env: Record<string, EnvironmentVariable>
  /** Undefined when there is no configuration file. */
  configPath?: string | undefined
  /** Path to the `_redirects` file, which may not exist. */
  redirectsPath: string
  /** Path to the `_headers` file, which may not exist. */
  headersPath: string
  buildDir: string
  repositoryRoot: string
  config: NetlifyConfig
  context: string
  branch: string
  token?: string | undefined
  /** The Netlify API client. Undefined without a token, or when offline. */
  api?: NetlifyAPI | undefined
  /** Only set with the `buffer` option. */
  logs?: BufferedLogs | undefined
}
