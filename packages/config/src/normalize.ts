import isPlainObj from 'is-plain-obj'

import { mergeConfigs } from './merge.js'
import { isDefined, removeUnset, spreadValue } from './normalize_values.js'
import type {
  FunctionConfig,
  FunctionsDirectoryOrigin,
  Logs,
  NormalizedConfig,
  RawConfig,
  SourceEntry,
} from './types.js'
import { checkMerged, checkNormalized, warnUnexpectedConfig } from './validate/rules.js'

export const WILDCARD_ALL = '*'

/** Properties of a function's configuration, which `functions.<property>` sets for every function. */
export const FUNCTION_CONFIG_PROPERTIES = new Set<string>([
  'deno_import_map',
  'directory',
  'external_node_modules',
  'ignored_node_modules',
  'included_files',
  'memory',
  'node_bundler',
  'region',
  'schedule',
  'vcpu',
] satisfies readonly (keyof FunctionConfig)[])

export const normalizeConfig = function (
  config: SourceEntry,
  { packagePath, logs }: { packagePath: string | undefined; logs: Logs | undefined },
): NormalizedConfig {
  checkMerged(config)
  const normalized = normalize(config, packagePath)
  checkNormalized(normalized)
  return warnUnexpectedConfig(normalized, logs)
}

const normalize = function (config: SourceEntry, packagePath: string | undefined): RawConfig {
  const { build, functions, plugins, ...rest } = mergeConfigs([getDefaults(packagePath), removeBlanks(config)])
  const { functions: v1FunctionsDirectory, ...buildWithoutFunctions } = spreadValue(build)
  const { functions: normalizedFunctions, directory } = normalizeFunctions(spreadValue(functions))
  return {
    ...rest,
    build: buildWithoutFunctions,
    functions: normalizedFunctions,
    plugins: Array.isArray(plugins) ? plugins.map(normalizePlugin) : plugins,
    ...getFunctionsDirectory(directory, v1FunctionsDirectory),
  }
}

// A blank value in a source erases the lower sources' value: merging let it win.
const removeBlanks = function ({ build, ...config }: SourceEntry): RawConfig {
  return removeUnset({ ...config, build: removeUnset(build) })
}

const getDefaults = (packagePath: string | undefined): RawConfig => ({
  build: {
    environment: {},
    publish: packagePath === undefined || packagePath === '' ? '.' : packagePath,
    publishOrigin: 'default',
    processing: { css: {}, html: {}, images: {}, js: {} },
    services: {},
  },
  functions: { [WILDCARD_ALL]: {} },
  plugins: [],
})

// `inputs: null` is removed with the other unset properties, so that plugin has no `inputs`.
const normalizePlugin = function (plugin: unknown): RawConfig {
  const { inputs, ...rest } = spreadValue(plugin)
  return removeUnset({ ...rest, inputs: inputs === undefined ? {} : inputs })
}

// Moves `functions.<property>` into `'*'`, where existing values win, and `'*'.directory` out of it.
// A `<property>` set to a function's configuration, e.g. `directory = {}`, names a function instead.
const normalizeFunctions = function ({ [WILDCARD_ALL]: wildcard, ...functions }: RawConfig): {
  functions: RawConfig
  directory: unknown
} {
  const entries = Object.entries(functions)
  const namedFunctions = Object.fromEntries(entries.filter((entry) => !isWildcardProperty(entry)))
  const normalizedWildcard = entries
    .filter(isWildcardProperty)
    .reduce<unknown>((all, [name, value]) => ({ [name]: value, ...spreadValue(all) }), wildcard)
  // `'*'` goes last. A `null` one is left for validation to report.
  if (normalizedWildcard === null) {
    return { functions: { ...namedFunctions, [WILDCARD_ALL]: null }, directory: undefined }
  }

  const { directory, ...wildcardConfig } = spreadValue(normalizedWildcard)
  return { functions: { ...namedFunctions, [WILDCARD_ALL]: wildcardConfig }, directory }
}

const isWildcardProperty = ([name, value]: [string, unknown]): boolean =>
  FUNCTION_CONFIG_PROPERTIES.has(name) && !isFunctionConfig(value)

const isFunctionConfig = (value: unknown): boolean =>
  isPlainObj(value) && Object.keys(value).every((key) => FUNCTION_CONFIG_PROPERTIES.has(key))

// QUIRK: the origin says `config` whichever source set the directory, e.g. `defaultConfig`.
const getFunctionsDirectory = function (
  directory: unknown,
  v1Directory: unknown,
): { functionsDirectory?: unknown; functionsDirectoryOrigin?: FunctionsDirectoryOrigin } {
  if (isDefined(directory)) {
    return { functionsDirectory: directory, functionsDirectoryOrigin: 'config' }
  }

  if (isDefined(v1Directory)) {
    return { functionsDirectory: v1Directory, functionsDirectoryOrigin: 'config-v1' }
  }

  return {}
}
