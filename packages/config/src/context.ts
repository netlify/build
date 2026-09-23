import isPlainObj from 'is-plain-obj'

import { mergeConfigs } from './merge.js'
import { normalizeBeforeConfigMerge } from './merge_normalize.js'
import type { ConfigOrigin } from './types/config.js'
import type { Logs } from './types/logs.js'
import { spreadValue } from './utils/object.js'
import { validateContextsPluginsConfig } from './validate/context.js'
import { parsePreContextConfig } from './validate/main.js'
import type { RawConfig, SourceCheckedConfig } from './validate/validations.js'

/** A source with each of its `context.*` entries validated and normalized as a source too. */
export type SourceWithContexts = SourceCheckedConfig & { context?: Record<string, SourceCheckedConfig> }

/** Properties that `context.{context}.*` may set directly, meaning `context.{context}.build.*`. */
const BUILD_PROPERTIES = new Set([
  'base',
  'command',
  'edge_functions',
  'environment',
  'functions',
  'ignore',
  'processing',
  'publish',
])

/** Validate and normalize each of `config.context.*`, as its own source. */
export const normalizeContextProps = function (config: SourceCheckedConfig, origin: ConfigOrigin): SourceWithContexts {
  const { context: contextProps } = parsePreContextConfig(config)
  if (contextProps === undefined) {
    return config
  }

  const normalizedContextProps = Object.fromEntries(
    Object.entries(contextProps).map(([key, contextConfig]) => [
      key,
      normalizeBeforeConfigMerge(addBuildNamespace(contextConfig), origin),
    ]),
  )
  return { ...config, context: normalizedContextProps }
}

// Applied in key order, so a later `build` key replaces build properties set before it.
const addBuildNamespace = function (contextConfig: RawConfig): RawConfig {
  return Object.entries(contextConfig).reduce<RawConfig>(
    (namespaced, [key, value]) =>
      isBuildProperty(key, value)
        ? { ...namespaced, build: { ...spreadValue(namespaced['build']), [key]: value } }
        : { ...namespaced, [key]: value },
    {},
  )
}

const isBuildProperty = function (key: string, value: unknown) {
  return (
    BUILD_PROPERTIES.has(key) &&
    !(key === 'functions' && isPlainObj(value)) &&
    !(key === 'edge_functions' && Array.isArray(value))
  )
}

type MergeContextOptions = {
  config: SourceWithContexts
  /** The `--context`, e.g. `production`. */
  context: string
  branch: string
  logs: Logs | undefined
}

/**
 * Merge the `config.context.*` entries that apply to this build: the one named after the context,
 * then the one named after the branch. Each is an exact match, or failing that every entry whose
 * name ends with `*` and is a prefix of it, e.g. `feat/*` for the `feat/my-branch` branch.
 */
export const mergeContext = function ({ config, context, branch, logs }: MergeContextOptions): SourceCheckedConfig {
  const { context: contextProps, ...rest } = config
  if (contextProps === undefined) {
    return rest
  }

  const contexts = [context, branch]
  validateContextsPluginsConfig({ contextProps, plugins: config.plugins, contexts, logs })
  const matchingContextProps = contexts.flatMap((key) => findMatchingContextProps(contextProps, key))
  return mergeConfigs([rest, ...matchingContextProps])
}

const findMatchingContextProps = function (
  contextProps: Record<string, SourceCheckedConfig>,
  key: string,
): SourceCheckedConfig[] {
  if (!key) {
    return []
  }

  const exactMatch = contextProps[key]
  if (exactMatch) {
    return [exactMatch]
  }

  return Object.entries(contextProps)
    .filter(([pattern, value]) => Boolean(value) && pattern.endsWith('*') && key.startsWith(pattern.slice(0, -1)))
    .map(([, value]) => value)
}

/**
 * Copy `config` into the given context and branch, so it takes priority over the file's
 * context-specific properties. It stays at the top level too, since the API doesn't treat every
 * property context-sensitively. `redirects` is only kept at the top level.
 */
export const ensureConfigPriority = function (
  { build = {}, ...config }: RawConfig,
  context: string,
  branch: string,
): RawConfig {
  const { redirects: _redirects, ...contextConfig } = config
  // Written like a `netlify.toml` context entry, with build properties at its top level.
  // `normalizeContextProps` moves them under `build`.
  const contextEntry = { ...contextConfig, ...spreadValue(build), build }
  return {
    ...config,
    build,
    context: {
      ...spreadValue(config['context']),
      [context]: contextEntry,
      [branch]: contextEntry,
    },
  }
}
