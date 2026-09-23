import { normalizeFunctionsProps, WILDCARD_ALL } from './functions_config.js'
import { mergeConfigs } from './merge.js'
import { DEFAULT_ORIGIN } from './origin.js'
import type { NormalizedNetlifyConfig, PartialNetlifyConfig, PluginConfig } from './types/config.js'
import { nonEmpty } from './utils/non_empty.js'
import { isPlainObj } from './utils/is_plain_obj.js'
import { removeFalsy, removeUndefined } from './utils/remove_falsy.js'

const getDefaultConfig = (packagePath?: string): PartialNetlifyConfig => ({
  build: {
    environment: {},
    publish: nonEmpty(packagePath) ?? '.',
    publishOrigin: DEFAULT_ORIGIN,
    processing: { css: {}, html: {}, images: {}, js: {} },
    services: {},
  },
  functions: { [WILDCARD_ALL]: {} },
  plugins: [],
})

/**
 * Fill in defaults and normalize `functions` and `plugins`. The result is only asserted to be a
 * `NormalizedNetlifyConfig`: it is validated right after.
 */
export const normalizeConfig = function (config: PartialNetlifyConfig, packagePath?: string): NormalizedNetlifyConfig {
  const { build, functions, plugins, server, ...rest } = mergeConfigs<PartialNetlifyConfig>([
    getDefaultConfig(packagePath),
    removeEmpty(config),
  ]) as NormalizedNetlifyConfig
  const {
    build: normalizedBuild,
    functions: normalizedFunctions,
    functionsDirectoryProps,
  } = normalizeFunctionsProps(build, functions)
  return {
    ...rest,
    build: normalizedBuild as NormalizedNetlifyConfig['build'],
    functions: normalizedFunctions,
    plugins: plugins.map(normalizePlugin),
    ...(isPlainObj(server) ? { server: normalizeServer(server) } : {}),
    ...functionsDirectoryProps,
  }
}

// An empty build command would otherwise be run, and fail the build.
const removeEmpty = function ({ build, ...config }: PartialNetlifyConfig): PartialNetlifyConfig {
  return removeFalsy({ ...config, build: removeFalsy(build ?? {}) })
}

const normalizePlugin = function ({ inputs = {}, ...plugin }: PluginConfig) {
  return removeFalsy({ ...plugin, inputs }) as PluginConfig & { inputs: Record<string, unknown> }
}

const lowerCase = (value: unknown) => (typeof value === 'string' ? value.toLowerCase() : value)

// `region` and `size` take a fixed set of values, which can be written in any case.
const normalizeServer = function ({ region, size, ...server }: Record<string, unknown>) {
  return removeUndefined({ ...server, region: lowerCase(region), size: lowerCase(size) })
}
