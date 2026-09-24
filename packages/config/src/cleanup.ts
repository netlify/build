import { spreadValue } from './normalize_values.js'
import { simplifyConfig } from './simplify.js'
import type { RawConfig } from './types.js'

/** Headers and redirects can be long enough to take minutes to print in build logs. */
const MAX_ARRAY_LENGTH = 100

// Set by the buildbot. Only variables set by the user are printed.
const BUILDBOT_ENVIRONMENT = new Set([
  'BRANCH',
  'CONTEXT',
  'DEPLOY_PRIME_URL',
  'DEPLOY_URL',
  'GO_VERSION',
  'NETLIFY_IMAGES_CDN_DOMAIN',
  'SITE_ID',
  'SITE_NAME',
  'URL',
])

/** Only the properties that are safe to print, with environment variable names only. */
export const cleanupConfig = function ({
  build = {},
  headers,
  headersOrigin,
  plugins = [],
  redirects,
  redirectsOrigin,
  baseRelDir,
  functions,
  functionsDirectory,
}: RawConfig): RawConfig {
  const {
    base,
    command,
    commandOrigin,
    environment = {},
    edge_functions,
    ignore,
    processing,
    publish,
    publishOrigin,
  } = objectOrThrow(build, 'build')
  const simplified = simplifyConfig({
    build: {
      base,
      command,
      commandOrigin,
      environment: cleanupEnvironment(objectOrThrow(environment, 'environment')),
      edge_functions,
      ignore,
      processing,
      publish,
      publishOrigin,
    },
    plugins: cleanupPlugins(plugins),
    headers,
    headersOrigin,
    redirects,
    redirectsOrigin,
    baseRelDir,
    functions,
    functionsDirectory,
  })
  return {
    ...simplified,
    ...truncate('headers', simplified['headers']),
    ...truncate('redirects', simplified['redirects']),
  }
}

export const cleanupEnvironment = (environment: object): string[] =>
  Object.keys(environment).filter((name) => !BUILDBOT_ENVIRONMENT.has(name))

const cleanupPlugins = function (plugins: unknown): RawConfig[] {
  if (!Array.isArray(plugins)) {
    throw new TypeError('plugins must be an array')
  }

  return plugins.map(cleanupPlugin)
}

// `origin` is kept as an own key even when `undefined`.
const cleanupPlugin = function (plugin: unknown): RawConfig {
  const { package: packageName, origin, inputs = {} } = objectOrThrow(plugin, 'plugin')
  const publicInputs = Object.entries(objectOrThrow(inputs, 'inputs')).filter(([, input]) => typeof input === 'boolean')
  return { package: packageName, origin, inputs: Object.fromEntries(publicInputs) }
}

const truncate = (name: string, array: unknown): RawConfig =>
  Array.isArray(array) && array.length > MAX_ARRAY_LENGTH ? { [name]: array.slice(0, MAX_ARRAY_LENGTH) } : {}

// Only `null` throws: no rule checks `build.environment`, so a string from `netlify.toml` must still print.
const objectOrThrow = function (value: unknown, name: string): RawConfig {
  if (value === null || value === undefined) {
    throw new TypeError(`${name} must be an object`)
  }

  return spreadValue(value)
}
