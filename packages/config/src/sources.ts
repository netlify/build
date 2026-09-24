import isPlainObj from 'is-plain-obj'

import { throwUserError } from './error.js'
import { isSet, spreadValue } from './normalize_values.js'
import type { ConfigOrigin, RawConfig, SourceConfig, SourceEntry, SourcePlugin } from './types.js'
import { checkBeforeCaseNormalization, checkConfigFile, checkContexts, checkSource } from './validate/rules.js'

/** The `build` properties that may be capitalized, and that context entries may set at their top level. */
const BUILD_PROPERTIES = {
  base: 'Base',
  command: 'Command',
  edge_functions: 'Edge_functions',
  environment: 'Environment',
  functions: 'Functions',
  ignore: 'Ignore',
  processing: 'Processing',
  publish: 'Publish',
} as const

const CASED_BUILD_PROPERTIES = new Set<string>([...Object.keys(BUILD_PROPERTIES), ...Object.values(BUILD_PROPERTIES)])

export const processSource = function (config: RawConfig, origin: ConfigOrigin): SourceConfig {
  const source = processEntry(config, origin)
  const contexts = checkContexts(source)
  // An `undefined` context is dropped when sources are merged.
  return { ...source, context: contexts === undefined ? undefined : processContexts(contexts, origin) }
}

const processContexts = (contexts: Record<string, RawConfig>, origin: ConfigOrigin): Record<string, SourceEntry> =>
  Object.fromEntries(
    Object.entries(contexts).map(([name, entry]) => [name, processEntry(addBuildNamespace(entry), origin)]),
  )

const processEntry = function (config: RawConfig, origin: ConfigOrigin): SourceEntry {
  checkBeforeCaseNormalization(config)
  const source = checkSource(normalizeCase(config))
  if (origin === 'config') {
    checkConfigFile(source)
  }
  const withOrigins = addOrigins(source, origin)
  checkDuplicatePlugins(withOrigins.plugins ?? [])
  return withOrigins
}

// `Build` is used only without `build`: the two are not merged. A `Build` that isn't an object is spread.
const normalizeCase = function ({ Build, build, ...config }: RawConfig): RawConfig {
  return { ...config, build: normalizeBuildCase(spreadValue(build ?? Build)) }
}

// Every lowercase property ends up present, possibly `undefined`, which shows in an `inlineConfig`'s
// unmerged `context`.
const normalizeBuildCase = function (build: Record<string, unknown>): Record<string, unknown> {
  const otherProperties = Object.entries(build).filter(([key]) => !CASED_BUILD_PROPERTIES.has(key))
  const lowercased = Object.entries(BUILD_PROPERTIES).map<[string, unknown]>(([key, capitalizedKey]) => [
    key,
    build[key] === undefined ? build[capitalizedKey] : build[key],
  ])
  return Object.fromEntries([...otherProperties, ...lowercased])
}

// A plugin's own `origin` key is kept, even when it is `undefined`.
const addOrigins = function (source: SourceEntry, origin: ConfigOrigin): SourceEntry {
  const { build, plugins } = source
  return {
    ...source,
    build: {
      ...build,
      ...(isSet(build.command) && { commandOrigin: origin }),
      ...(isSet(build['publish']) && { publishOrigin: origin }),
    },
    ...(plugins !== undefined && { plugins: plugins.map((plugin) => ({ origin, ...plugin })) }),
    ...(isSet(source['headers']) && { headersOrigin: origin }),
    ...(isSet(source['redirects']) && { redirectsOrigin: origin }),
  }
}

// Plugins from different sources are merged instead.
const checkDuplicatePlugins = function (plugins: readonly SourcePlugin[]): void {
  plugins.forEach((plugin, index) => {
    const isDuplicated = plugins
      .slice(index + 1)
      .some((otherPlugin) => otherPlugin['package'] === plugin['package'] && otherPlugin.origin === plugin.origin)
    if (isDuplicated) {
      throwUserError(
        `Plugin "${String(plugin['package'])}" must not be specified twice in ${getOriginName(plugin.origin)}`,
      )
    }
  })
}

// QUIRK: other origins, such as `inline`, have always been named "undefined".
const getOriginName = function (origin: unknown): string {
  if (origin === 'config') {
    return 'netlify.toml'
  }
  return origin === 'ui' ? 'the app' : 'undefined'
}

// Applied in key order, so a later `build` key replaces the build properties set before it.
const addBuildNamespace = function (entry: RawConfig): RawConfig {
  return Object.entries(entry).reduce<RawConfig>(
    (namespaced, [key, value]) =>
      isBuildProperty(key, value)
        ? { ...namespaced, build: { ...spreadValue(namespaced['build']), [key]: value } }
        : { ...namespaced, [key]: value },
    {},
  )
}

// `functions` is also function configuration when it is an object, and `edge_functions` is also
// the list of declarations when it is an array. Capitalized keys are not namespaced.
const isBuildProperty = function (key: string, value: unknown): boolean {
  return (
    Object.hasOwn(BUILD_PROPERTIES, key) &&
    !(key === 'functions' && isPlainObj(value)) &&
    !(key === 'edge_functions' && Array.isArray(value))
  )
}
