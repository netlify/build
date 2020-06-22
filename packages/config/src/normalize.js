const { deepMerge } = require('./utils/merge')
const { removeFalsy } = require('./utils/remove_falsy')

// Normalize configuration object
const normalizeConfig = function(config) {
  const { build, plugins, ...configA } = deepMerge(DEFAULT_CONFIG, config)
  const buildA = removeEmptyCommand(build)
  const pluginsA = plugins.map(normalizePlugin)
  return { ...configA, build: buildA, plugins: pluginsA }
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

const normalizePlugin = function({ package, inputs = {}, origin, ...plugin }) {
  return removeFalsy({ ...plugin, package, inputs, origin })
}

module.exports = { normalizeConfig }
