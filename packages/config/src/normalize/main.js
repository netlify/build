const { deepMerge } = require('../utils/merge')
const { removeFalsy } = require('../utils/remove_falsy')

const { normalizeLifecycle } = require('./lifecycle')

// Normalize configuration object
const normalizeConfig = function(config) {
  const { build, plugins, ...configA } = deepMerge(DEFAULT_CONFIG, config)
  const buildA = normalizeLifecycle(build)
  const buildB = removeEmptyCommand(buildA)
  const pluginsA = plugins.map(normalizePlugin)
  return { ...configA, build: buildB, plugins: pluginsA }
}

const DEFAULT_CONFIG = {
  build: { environment: {} },
  plugins: [],
}

const removeEmptyCommand = function({ command, ...build }) {
  if (command === undefined || command.trim() === '') {
    return build
  }

  return { ...build, command }
}

// `plugins[*].package` was previously called `plugins[*].type`
// Same with `plugins[*].config` renamed to `plugins[*].inputs`
// TODO: remove after the Beta release since it's legacy
const normalizePlugin = function({
  type,
  package = type,
  config,
  inputs = config,
  origin = DEFAULT_ORIGIN,
  ...plugin
}) {
  return removeFalsy({ ...plugin, package, inputs, origin })
}

const DEFAULT_ORIGIN = 'config'

module.exports = { normalizeConfig }
