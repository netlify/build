import process from 'process'

import isPlainObj from 'is-plain-obj'
import * as z from 'zod'

import { logObject, logSubHeader, logWarning } from './log.js'
import type { BufferedLogs, ConfigMutation, RawConfig, ResolveConfigOptions, TestOptions } from './types.js'
import { parseLeniently } from './validate/lenient.js'

/** `resolveConfig`'s options with every default applied. Directories are resolved later. */
export interface ResolvedOptions {
  config?: string | undefined
  defaultConfig: RawConfig
  inlineConfig: RawConfig
  configMutations: ConfigMutation[]
  configMutationsOrigin?: string | undefined
  cachedConfig?: unknown
  cachedConfigPath?: string | undefined
  /** Whether the raw `defaultConfig` option was not `undefined`: `null` and `{}` count. */
  hasDefaultConfig: boolean
  /** Made absolute and checked later, by `resolveDirectories`. */
  cwd: string
  repositoryRoot?: string | undefined
  packagePath?: string | undefined
  base?: string | undefined
  baseRelDir?: boolean | undefined
  /** `resolveDirectories` falls back to git. */
  branch?: string | undefined
  context: string
  siteId?: string | undefined
  accountId?: string | undefined
  deployId: string
  buildId: string
  skewProtectionToken?: string | undefined
  token?: string | undefined
  host?: string | undefined
  scheme?: string | undefined
  pathPrefix?: string | undefined
  siteFeatureFlagPrefix?: string | undefined
  /** Usually a `Mode`, but any string is passed on. */
  mode: string
  offline: boolean
  debug: boolean
  /** Undefined unless `buffer`: logs are then printed to stderr. */
  logs: BufferedLogs | undefined
  /** The `env` option only, not merged with `process.env`. */
  env: Record<string, string | undefined>
  featureFlags: Record<string, unknown>
  testOpts: TestOptions
}

export const resolveOptions = function (options: ResolveConfigOptions): ResolvedOptions {
  const env = given(options.env) ?? {}
  const combinedEnv = { ...process.env, ...env }
  const fromEnv = (name: string) => given(combinedEnv[name])

  const logs: BufferedLogs | undefined = given(options.buffer) ? { stdout: [], stderr: [] } : undefined
  const rawDefaultConfig = given(options.defaultConfig)
  const defaultConfig = toConfigObject(rawDefaultConfig, 'defaultConfig', logs)
  const inlineConfig = toConfigObject(given(options.inlineConfig), 'inlineConfig', logs)
  const configMutations = parseLeniently(configMutationsSchema, given(options.configMutations) ?? [], {
    description: 'configMutations option',
    logs,
  })

  const resolved: ResolvedOptions = {
    config: given(options.config),
    defaultConfig,
    inlineConfig,
    configMutations,
    configMutationsOrigin: given(options.configMutationsOrigin),
    cachedConfig: given(options.cachedConfig),
    cachedConfigPath: given(options.cachedConfigPath),
    hasDefaultConfig: options.defaultConfig !== undefined,
    // `process.cwd()` throws when the current directory was deleted, so it's only called when needed.
    cwd: given(options.cwd) ?? process.cwd(),
    repositoryRoot: given(options.repositoryRoot),
    packagePath: given(options.packagePath),
    base: given(options.base),
    baseRelDir: given(options.baseRelDir),
    branch: given(options.branch) ?? fromEnv('BRANCH'),
    context: given(options.context) ?? fromEnv('CONTEXT') ?? 'production',
    siteId: given(options.siteId) ?? fromEnv('NETLIFY_SITE_ID'),
    accountId: given(options.accountId),
    // Local builds have no deploy, so they use placeholder IDs.
    deployId: given(options.deployId) ?? fromEnv('DEPLOY_ID') ?? '0',
    buildId: given(options.buildId) ?? fromEnv('BUILD_ID') ?? '0',
    skewProtectionToken: given(options.skewProtectionToken) ?? fromEnv('NETLIFY_SKEW_PROTECTION_TOKEN'),
    token: given(options.token) ?? fromEnv('NETLIFY_AUTH_TOKEN'),
    host: given(options.host) ?? fromEnv('NETLIFY_API_HOST'),
    scheme: given(options.scheme),
    pathPrefix: given(options.pathPrefix),
    siteFeatureFlagPrefix: given(options.siteFeatureFlagPrefix),
    mode: given(options.mode) ?? 'require',
    offline: given(options.offline) ?? false,
    // Any non-empty string enables it, even `'false'`.
    debug:
      given(options.debug) ?? (Boolean(combinedEnv['NETLIFY_BUILD_DEBUG']) || Boolean(getUiDebug(rawDefaultConfig))),
    logs,
    env,
    // A value that isn't an object is spread as is: a string gives its characters by index.
    featureFlags: { ...given(options.featureFlags) },
    // Its properties are passed on as given: `api.ts` treats an empty `host` as unset.
    testOpts: given(options.testOpts) ?? {},
  }

  if (resolved.debug && resolved.cachedConfig === undefined && resolved.cachedConfigPath === undefined) {
    logSubHeader(logs, 'Initial build environment')
    logObject(logs, getPrintableOptions(options))
  }

  return resolved
}

const given = function <Value>(value: Value | null | undefined): Value | undefined {
  if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) {
    return undefined
  }
  return value
}

/** A configuration option that isn't an object is spread into one, as it always has been, with a warning. */
const toConfigObject = function (value: unknown, name: string, logs: BufferedLogs | undefined): RawConfig {
  if (value === undefined || value === null) {
    return {}
  }

  if (isPlainObj(value)) {
    return value
  }

  logWarning(logs, `Unexpected ${name} option, which should be an object, spread into one`)
  return Object.fromEntries(Object.entries(value))
}

const configMutationsSchema: z.ZodType<ConfigMutation[]> = z.array(
  z.looseObject({
    keys: z.array(z.union([z.string(), z.number()])),
    value: z.unknown().nonoptional(),
    event: z.string(),
  }),
)

/** Debug mode can also be enabled in the UI build settings, through an environment variable. */
const getUiDebug = function (defaultConfig: unknown): unknown {
  const environment = getProperty(getProperty(defaultConfig, 'build'), 'environment')
  return getProperty(environment, 'NETLIFY_BUILD_DEBUG')
}

const getProperty = function (value: unknown, key: string): unknown {
  return typeof value === 'object' && value !== null ? Reflect.get(value, key) : undefined
}

// `yaml` omits `undefined` values. `featureFlags` would list the enabled flags this package defines
// defaults for, and there are none.
const getPrintableOptions = function (options: ResolveConfigOptions) {
  const envNames = Object.keys(given(options.env) ?? {})
  return {
    config: given(options.config),
    cwd: given(options.cwd),
    context: given(options.context),
    branch: given(options.branch),
    mode: given(options.mode),
    repositoryRoot: given(options.repositoryRoot),
    siteId: given(options.siteId),
    baseRelDir: given(options.baseRelDir),
    env: envNames.length === 0 ? undefined : envNames,
    featureFlags: [],
  }
}
