import { normalizeFunctionsProps, WILDCARD_ALL } from './functions_config.js'
import { mergeConfigs } from './merge.js'
import { DEFAULT_ORIGIN } from './origin.js'
import { removeFalsy, removeUndefined } from './utils/remove_falsy.js'

/**
 * Normalize configuration object
 */
export const normalizeConfig = function (config: $TSFixMe, packagePath?: string) {
  const configA = removeEmpty(config)
  const { build, functions, plugins, server, ...configB } = mergeConfigs([
    DEFAULT_CONFIG(packagePath),
    configA,
  ]) as $TSFixMe
  const { build: buildA, functions: functionsA, functionsDirectoryProps } = normalizeFunctionsProps(build, functions)
  const pluginsA = plugins.map(normalizePlugin)
  const serverProps = server === undefined ? {} : { server: normalizeServer(server) }
  return {
    ...configB,
    build: buildA,
    functions: functionsA,
    plugins: pluginsA,
    ...serverProps,
    ...functionsDirectoryProps,
  }
}

/**
 * Remove empty strings.
 * This notably ensures that empty strings in the build command are removed.
 * Otherwise, those would be run during builds, making the build fail.
 */
const removeEmpty = function ({ build, ...config }) {
  return removeFalsy({ ...config, build: removeFalsy(build) })
}

const DEFAULT_CONFIG = (packagePath?: string) => ({
  build: {
    environment: {},
    publish: packagePath || '.',
    publishOrigin: DEFAULT_ORIGIN,
    processing: { css: {}, html: {}, images: {}, js: {} },
    services: {},
  },
  functions: { [WILDCARD_ALL]: {} },
  plugins: [],
})

const normalizePlugin = function ({ inputs = {}, ...plugin }) {
  return removeFalsy({ ...plugin, inputs })
}

const lowerCase = (value: unknown) => (typeof value === 'string' ? value.toLowerCase() : value)

// `region` and `size` take a fixed set of values, which can be written in any
// case.
const normalizeServer = function ({ region, size, ...server }: Record<string, unknown>) {
  return removeUndefined({ ...server, region: lowerCase(region), size: lowerCase(size) })
}
