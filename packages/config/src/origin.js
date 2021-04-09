'use strict'

// `build.commandOrigin` and `plugins[*].origin` constants
const UI_ORIGIN = 'ui'
const CONFIG_ORIGIN = 'config'

// Add `build.commandOrigin` and `plugins[*].origin`.
// This shows whether those properties came from the `ui` or from the `config`.
const addOrigins = function (config, origin) {
  const configA = addBuildCommandOrigin(config, origin)
  const configB = addConfigPluginOrigin(configA, origin)
  return configB
}

// This also removes empty build commands.
const addBuildCommandOrigin = function ({ build: { command, ...build } = {}, ...config }, commandOrigin) {
  return command === undefined || (typeof command === 'string' && command.trim() === '')
    ? { ...config, build }
    : { ...config, build: { ...build, command, commandOrigin } }
}

const addConfigPluginOrigin = function ({ plugins, ...config }, origin) {
  if (plugins === undefined) {
    return config
  }

  const pluginsA = plugins.map((plugin) => ({ ...plugin, origin }))
  return { ...config, plugins: pluginsA }
}

module.exports = { addOrigins, UI_ORIGIN, CONFIG_ORIGIN }
