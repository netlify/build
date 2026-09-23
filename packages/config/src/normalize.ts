import { normalizeFunctionsProps, WILDCARD_ALL } from './functions_config.js'
import { mergeConfigs } from './merge.js'
import { DEFAULT_ORIGIN } from './origin.js'
import { nonEmpty } from './utils/non_empty.js'
import { removeFalsy, removeUndefined } from './utils/remove_falsy.js'
import type { MergeCheckedConfig, RawConfig } from './validate/validations.js'

const getDefaultConfig = (packagePath: string | undefined): MergeCheckedConfig => ({
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

/** Fill in defaults and normalize `functions` and `plugins`. The result is validated right after. */
export const normalizeConfig = function (config: MergeCheckedConfig, packagePath: string | undefined): RawConfig {
  const {
    build = {},
    functions = {},
    plugins = [],
    server,
    ...rest
  } = mergeConfigs([getDefaultConfig(packagePath), removeEmpty(config)])
  const {
    build: normalizedBuild,
    functions: normalizedFunctions,
    functionsDirectoryProps,
  } = normalizeFunctionsProps(build, functions)
  return {
    ...rest,
    build: normalizedBuild,
    functions: normalizedFunctions,
    plugins: plugins.map(normalizePlugin),
    ...(server === undefined ? {} : { server: normalizeServer(server) }),
    ...functionsDirectoryProps,
  }
}

// An empty build command would otherwise be run, and fail the build.
const removeEmpty = function ({ build, ...config }: MergeCheckedConfig): MergeCheckedConfig {
  return removeFalsy({ ...config, build: removeFalsy(build ?? {}) })
}

const normalizePlugin = function ({ inputs = {}, ...plugin }: Record<string, unknown>) {
  return removeFalsy({ ...plugin, inputs })
}

const lowerCase = (value: unknown) => (typeof value === 'string' ? value.toLowerCase() : value)

// `region` and `size` take a fixed set of values, which can be written in any case.
const normalizeServer = function ({ region, size, ...server }: Record<string, unknown>) {
  return removeUndefined({ ...server, region: lowerCase(region), size: lowerCase(size) })
}
