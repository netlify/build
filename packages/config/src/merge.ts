import deepmerge from 'deepmerge'
import isPlainObj from 'is-plain-obj'

import { isDefined } from './normalize_values.js'

type PluginLike = Record<PropertyKey, unknown> & { package: string }

/**
 * Deep-merge configurations, later ones winning. `null` and `undefined` at the top level and
 * directly in `build` are ignored, and the result always has `build`.
 */
export const mergeConfigs = function <T extends Record<string, unknown>>(
  configs: readonly T[],
  { concatenateArrays = false }: { concatenateArrays?: boolean } = {},
): T {
  const arrayMerge = concatenateArrays ? concatenateLaterFirst : mergeArrays
  // deepmerge only types its result as `object`. The inputs merged are typed as the input type,
  // which is unvalidated anyway.
  return deepmerge.all(configs.map(removeNullProperties), { arrayMerge }) as T
}

const removeNullProperties = function ({ build, ...config }: Record<string, unknown>): Record<string, unknown> {
  return removeNull({ ...config, build: isPlainObj(build) ? removeNull(build) : {} })
}

const removeNull = (object: Record<string, unknown>): Record<string, unknown> =>
  Object.fromEntries(Object.entries(object).filter(([, value]) => isDefined(value)))

// deepmerge also calls this to copy an array into an empty one, so lists of plugins are always
// grouped by package, even within one config.
const mergeArrays = function (target: unknown[], source: unknown[]): unknown[] {
  return isPluginList(target) && isPluginList(source) ? mergePlugins(target, source) : source
}

const concatenateLaterFirst = (target: unknown[], source: unknown[]): unknown[] => [...source, ...target]

// deepmerge doesn't say which property is merged, so plugin lists are recognized by their shape.
// An empty array qualifies, so a later `plugins: []` does not clear earlier plugins.
const isPluginList = (array: unknown[]): array is PluginLike[] => array.every(isPluginLike)

const isPluginLike = (value: unknown): value is PluginLike => isPlainObj(value) && typeof value['package'] === 'string'

const mergePlugins = function (pluginsA: PluginLike[], pluginsB: PluginLike[]): Record<string, unknown>[] {
  return groupByPackage([...pluginsA, ...pluginsB]).map((plugins) =>
    plugins.reduce<Record<string, unknown>>(
      (merged, plugin) => deepmerge<Record<string, unknown>>(merged, plugin, { arrayMerge: mergeArrays }),
      {},
    ),
  )
}

const groupByPackage = function (plugins: PluginLike[]): PluginLike[][] {
  const groups = new Map<string, PluginLike[]>()
  for (const plugin of plugins) {
    groups.set(plugin.package, [...(groups.get(plugin.package) ?? []), plugin])
  }
  return [...groups.values()]
}
