import { isTruthy } from './utils/remove_falsy.js'

// `build.commandOrigin`, `build.publishOrigin` and `plugins[*].origin` constants
export const UI_ORIGIN = 'ui'
export const CONFIG_ORIGIN = 'config'
export const DEFAULT_ORIGIN = 'default'
export const INLINE_ORIGIN = 'inline'

// Add `build.commandOrigin`, `build.publishOrigin` and `plugins[*].origin`.
// This shows whether those properties came from the `ui` or from the `config`.
export const addOrigins = function (config, origin) {
  const configA = addBuildCommandOrigin({ config, origin })
  const configB = addBuildPublishOrigin({ config: configA, origin })
  const configC = addConfigPluginOrigin({ config: configB, origin })
  const configD = addHeadersOrigin({ config: configC, origin })
  const configE = addRedirectsOrigin({ config: configD, origin })
  return configE
}

const addBuildCommandOrigin = function ({ config, config: { build = {} }, origin }) {
  return isTruthy(build.command) ? { ...config, build: { ...build, commandOrigin: origin } } : config
}

const addBuildPublishOrigin = function ({ config, config: { build = {} }, origin }) {
  return isTruthy(build.publish) ? { ...config, build: { ...build, publishOrigin: origin } } : config
}

const addConfigPluginOrigin = function ({ config, config: { plugins }, origin }) {
  return Array.isArray(plugins) ? { ...config, plugins: plugins.map((plugin) => ({ ...plugin, origin })) } : config
}

const addHeadersOrigin = function ({ config, config: { headers }, origin }) {
  return isTruthy(headers) ? { ...config, headersOrigin: origin } : config
}

const addRedirectsOrigin = function ({ config, config: { redirects }, origin }) {
  return isTruthy(redirects) ? { ...config, redirectsOrigin: origin } : config
}
