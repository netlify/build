'use strict'

// `build.commandOrigin` and `plugins[*].origin` constants
const UI_ORIGIN = 'ui'
const CONFIG_ORIGIN = 'config'

// Add `build.commandOrigin`. This shows whether `build.command` came from the
// `ui` or from the `config`.
// This also removes empty build commands.
const addBuildCommandOrigins = function (defaultConfig, config, inlineConfig) {
  return [
    addBuildCommandOrigin(defaultConfig, UI_ORIGIN),
    addBuildCommandOrigin(config, CONFIG_ORIGIN),
    addBuildCommandOrigin(inlineConfig, CONFIG_ORIGIN),
  ]
}

const addBuildCommandOrigin = function ({ build: { command, ...build } = {}, ...config }, commandOrigin) {
  return command === undefined || (typeof command === 'string' && command.trim() === '')
    ? { ...config, build }
    : { ...config, build: { ...build, command, commandOrigin } }
}

// Add `plugins[*].origin`. This is like `build.commandOrigin` but for plugins.
const addPluginsOrigins = function (defaultConfig, config, inlineConfig) {
  return [
    addConfigPluginOrigin(defaultConfig, UI_ORIGIN),
    addConfigPluginOrigin(config, CONFIG_ORIGIN),
    addConfigPluginOrigin(inlineConfig, CONFIG_ORIGIN),
  ]
}

const addConfigPluginOrigin = function ({ plugins = [], ...config }, origin) {
  const pluginsA = plugins.map((plugin) => ({ ...plugin, origin }))
  return { ...config, plugins: pluginsA }
}

module.exports = { addBuildCommandOrigins, addBuildCommandOrigin, addPluginsOrigins, CONFIG_ORIGIN }
