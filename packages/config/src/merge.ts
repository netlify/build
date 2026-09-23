import deepmerge from 'deepmerge'
import isPlainObj from 'is-plain-obj'

import type { PluginConfig } from './types/config.js'
import { groupBy } from './utils/group.js'
import { removeUndefined } from './utils/remove_falsy.js'

/**
 * Deep-merge configuration objects, later ones taking priority. `undefined` values, including in
 * `build`, are ignored. Arrays are replaced, except `plugins`, whose entries are merged by
 * `package`. With `concatenateArrays`, arrays are concatenated instead, the later config's items
 * first.
 */
export const mergeConfigs = function <T extends object>(
  configs: readonly T[],
  { concatenateArrays = false }: { concatenateArrays?: boolean } = {},
): T {
  const cleanedConfigs = configs.map(removeUndefinedProps)
  return deepmerge.all<T>(cleanedConfigs, { arrayMerge: concatenateArrays ? concatenateLaterFirst : mergeArrays })
}

const removeUndefinedProps = function (config: object): object {
  const { build = {}, ...rest } = config as { build?: object }
  return removeUndefined({ ...rest, build: removeUndefined(build) })
}

// deepmerge concatenates arrays by default.
const mergeArrays = function (target: unknown[], source: unknown[]): unknown[] {
  if (isPluginsArray(target) && isPluginsArray(source)) {
    return mergePlugins(target, source)
  }

  return source
}

const concatenateLaterFirst = function (target: unknown[], source: unknown[]): unknown[] {
  return [...source, ...target]
}

// deepmerge doesn't say which property is being merged, so plugin lists are recognized by their shape.
const isPluginsArray = function (array: unknown[]): array is PluginConfig[] {
  return array.every((item) => isPlainObj(item) && typeof item.package === 'string')
}

const mergePlugins = function (pluginsA: PluginConfig[], pluginsB: PluginConfig[]): PluginConfig[] {
  return groupBy([...pluginsA, ...pluginsB], 'package').map((plugins) =>
    plugins.reduce<PluginConfig>(
      (merged, plugin) => deepmerge(merged, plugin, { arrayMerge: mergeArrays }),
      {} as PluginConfig,
    ),
  )
}
