'use strict'

// `build.commandOrigin` and `plugins[*].origin` constants
const UI_ORIGIN = 'ui'
const CONFIG_ORIGIN = 'config'

// Add `build.commandOrigin`. This shows whether `build.command` came from the
// `ui` or from the `config`.
// This also removes empty build commands.
const addBuildCommandOrigins = function (defaultConfig, config, inlineConfig) {
  return [
    addBuildCommandUiOrigin(defaultConfig),
    addBuildCommandConfigOrigin(config),
    addBuildCommandConfigOrigin(inlineConfig),
  ]
}

const addBuildCommandOrigin = function (commandOrigin, { build = {}, ...config }) {
  const buildA = addCommandOrigin(commandOrigin, build)
  return { ...config, build: buildA }
}

const addBuildCommandUiOrigin = addBuildCommandOrigin.bind(null, UI_ORIGIN)
const addBuildCommandConfigOrigin = addBuildCommandOrigin.bind(null, CONFIG_ORIGIN)

const addCommandOrigin = function (commandOrigin, { command, ...build }) {
  if (command === undefined || (typeof command === 'string' && command.trim() === '')) {
    return build
  }

  return { ...build, command, commandOrigin }
}

const addCommandConfigOrigin = addCommandOrigin.bind(null, CONFIG_ORIGIN)

// Add `plugins[*].origin`. This is like `build.commandOrigin` but for plugins.
const addPluginsOrigins = function (defaultPlugins, plugins, inlinePlugins) {
  return [
    defaultPlugins.map(addPluginUiOrigin),
    plugins.map(addPluginConfigOrigin),
    inlinePlugins.map(addPluginConfigOrigin),
  ]
}

const addPluginOrigin = function (origin, plugin) {
  return { ...plugin, origin }
}

const addPluginUiOrigin = addPluginOrigin.bind(null, UI_ORIGIN)
const addPluginConfigOrigin = addPluginOrigin.bind(null, CONFIG_ORIGIN)

module.exports = { addBuildCommandOrigins, addCommandConfigOrigin, addPluginsOrigins }
