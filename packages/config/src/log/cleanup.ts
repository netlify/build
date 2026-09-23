import { simplifyConfig } from '../simplify.js'
import type { PartialNetlifyConfig, PluginConfig } from '../types/config.js'

/** Headers and redirects can be long enough to take minutes to print in build logs, so they are truncated. */
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

/**
 * The configuration without anything that could be secret, and without defaults, for printing. Uses an
 * allow-list: environment variables are reduced to their names, and plugin inputs to those with boolean values.
 */
export const cleanupConfig = function ({
  build: {
    base,
    command,
    commandOrigin,
    environment = {},
    edge_functions: edgeFunctions,
    ignore,
    processing,
    publish,
    publishOrigin,
  } = {},
  headers,
  headersOrigin,
  plugins = [],
  redirects,
  redirectsOrigin,
  baseRelDir,
  functions,
  functionsDirectory,
}: PartialNetlifyConfig): Record<string, unknown> {
  const netlifyConfig = simplifyConfig({
    build: {
      base,
      command,
      commandOrigin,
      environment: cleanupEnvironment(environment),
      edge_functions: edgeFunctions,
      ignore,
      processing,
      publish,
      publishOrigin,
    },
    plugins: plugins.map(cleanupPlugin),
    headers,
    headersOrigin,
    redirects,
    redirectsOrigin,
    baseRelDir,
    functions,
    functionsDirectory,
  })
  return truncateArray(truncateArray(netlifyConfig, 'headers'), 'redirects')
}

/** The names of the environment variables set by the user. */
export const cleanupEnvironment = function (environment: Record<string, unknown>): string[] {
  return Object.keys(environment).filter((key) => !BUILDBOT_ENVIRONMENT.has(key))
}

const cleanupPlugin = function ({ package: packageName, origin, inputs = {} }: PluginConfig): PluginConfig {
  const publicInputs = Object.fromEntries(Object.entries(inputs).filter(([, input]) => typeof input === 'boolean'))
  return { package: packageName, origin, inputs: publicInputs }
}

const truncateArray = function (netlifyConfig: Record<string, unknown>, propName: 'headers' | 'redirects') {
  const array = netlifyConfig[propName]
  return Array.isArray(array) && array.length > MAX_ARRAY_LENGTH
    ? { ...netlifyConfig, [propName]: array.slice(0, MAX_ARRAY_LENGTH) }
    : netlifyConfig
}
