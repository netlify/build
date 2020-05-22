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

const normalizePlugin = function({ package, inputs, origin = DEFAULT_ORIGIN, ...plugin }) {
  return removeFalsy({ ...plugin, package, inputs, origin })
}

const DEFAULT_ORIGIN = 'config'

module.exports = { normalizeConfig }
