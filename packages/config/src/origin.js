'use strict'

const { isTruthy } = require('./utils/remove_falsy')

// `build.commandOrigin`, `build.publishOrigin` and `plugins[*].origin` constants
const UI_ORIGIN = 'ui'
const CONFIG_ORIGIN = 'config'
const DEFAULT_ORIGIN = 'default'
const INLINE_ORIGIN = 'inline'

// Add `build.commandOrigin`, `build.publishOrigin` and `plugins[*].origin`.
// This shows whether those properties came from the `ui` or from the `config`.
const addOrigins = function (config, origin) {
  const configA = addBuildCommandOrigin({ config, origin })
  const configB = addBuildPublishOrigin({ config: configA, origin })
  const configC = addConfigPluginOrigin({ config: configB, origin })
  const configD = addRedirectsOrigin({ config: configC, origin })
  return configD
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

const addRedirectsOrigin = function ({ config, config: { redirects }, origin }) {
  return isTruthy(redirects) ? { ...config, redirectsOrigin: origin } : config
}

module.exports = { addOrigins, UI_ORIGIN, CONFIG_ORIGIN, DEFAULT_ORIGIN, INLINE_ORIGIN }
