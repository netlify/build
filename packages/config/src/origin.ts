import { isTruthy } from './utils/remove_falsy.js'

export type Origin = 'ui' | 'config' | 'default' | 'inline'

interface Plugin {
  package: string
  origin?: Origin
  [key: string]: any
}

interface Config {
  build?: {
    command?: string
    commandOrigin?: Origin
    publish?: string
    publishOrigin?: Origin
    [key: string]: any
  }
  plugins?: Plugin[]
  headers?: any
  headersOrigin?: Origin
  redirects?: any
  redirectsOrigin?: Origin
  [key: string]: any
}

// `build.commandOrigin`, `build.publishOrigin` and `plugins[*].origin` constants
export const UI_ORIGIN: Origin = 'ui'
export const CONFIG_ORIGIN: Origin = 'config'
export const DEFAULT_ORIGIN: Origin = 'default'
export const INLINE_ORIGIN: Origin = 'inline'

// Add `build.commandOrigin`, `build.publishOrigin` and `plugins[*].origin`.
// This shows whether those properties came from the `ui` or from the `config`.
export const addOrigins = function (config: Config, origin: Origin): Config {
  const configA = addBuildCommandOrigin({ config, origin })
  const configB = addBuildPublishOrigin({ config: configA, origin })
  const configC = addConfigPluginOrigin({ config: configB, origin })
  const configD = addHeadersOrigin({ config: configC, origin })
  const configE = addRedirectsOrigin({ config: configD, origin })
  return configE
}

const addBuildCommandOrigin = function ({
  config,
  config: { build = {} },
  origin,
}: {
  config: Config
  origin: Origin
}): Config {
  return isTruthy(build.command) ? { ...config, build: { ...build, commandOrigin: origin } } : config
}

const addBuildPublishOrigin = function ({
  config,
  config: { build = {} },
  origin,
}: {
  config: Config
  origin: Origin
}): Config {
  return isTruthy(build.publish) ? { ...config, build: { ...build, publishOrigin: origin } } : config
}

const addConfigPluginOrigin = function ({
  config,
  config: { plugins },
  origin,
}: {
  config: Config
  origin: Origin
}): Config {
  return Array.isArray(plugins) ? { ...config, plugins: plugins.map((plugin) => ({ origin, ...plugin })) } : config
}

const addHeadersOrigin = function ({ config, config: { headers }, origin }: { config: Config; origin: Origin }): Config {
  return isTruthy(headers) ? { ...config, headersOrigin: origin } : config
}

const addRedirectsOrigin = function ({
  config,
  config: { redirects },
  origin,
}: {
  config: Config
  origin: Origin
}): Config {
  return isTruthy(redirects) ? { ...config, redirectsOrigin: origin } : config
}
