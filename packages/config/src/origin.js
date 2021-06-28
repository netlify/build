'use strict'

// `build.commandOrigin`, `build.publishOrigin` and `plugins[*].origin` constants
const UI_ORIGIN = 'ui'
const CONFIG_ORIGIN = 'config'
const DEFAULT_ORIGIN = 'default'
const PLUGIN_ORIGIN = 'plugin'

// Add `build.commandOrigin`, `build.publishOrigin` and `plugins[*].origin`.
// This shows whether those properties came from the `ui` or from the `config`.
const addOrigins = function (config, origin) {
  const configA = addBuildCommandOrigin(config, origin)
  const configB = addBuildPublishOrigin(configA, origin)
  const configC = addConfigPluginOrigin(configB, origin)
  const configD = addRedirectsOrigin(configC, origin)
  return configD
}

// This also removes empty build commands.
const addBuildCommandOrigin = function ({ build: { command, ...build } = {}, ...config }, commandOrigin) {
  return command === undefined || (typeof command === 'string' && command.trim() === '')
    ? { ...config, build }
    : { ...config, build: { ...build, command, commandOrigin } }
}

const addBuildPublishOrigin = function ({ build, build: { publish }, ...config }, publishOrigin) {
  return publish === undefined ? { ...config, build } : { ...config, build: { ...build, publishOrigin } }
}

const addConfigPluginOrigin = function ({ plugins, ...config }, origin) {
  if (plugins === undefined) {
    return config
  }

  const pluginsA = plugins.map((plugin) => ({ ...plugin, origin }))
  return { ...config, plugins: pluginsA }
}

const addRedirectsOrigin = function (config, redirectsOrigin) {
  return config.redirects === undefined ? config : { ...config, redirectsOrigin }
}

module.exports = { addOrigins, UI_ORIGIN, CONFIG_ORIGIN, DEFAULT_ORIGIN, PLUGIN_ORIGIN }
