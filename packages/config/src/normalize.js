const { deepMerge } = require('./utils/merge')
const { removeFalsy } = require('./utils/remove_falsy')

// Normalize configuration object
const normalizeConfig = function(config) {
  const configA = normalizePropertiesCase(config)
  const configB = deepMerge(DEFAULT_CONFIG, configA)
  const { build, plugins, ...configC } = configB
  const buildA = removeEmptyCommand(build)
  const pluginsA = plugins.map(normalizePlugin)
  return { ...configC, build: buildA, plugins: pluginsA }
}

const DEFAULT_CONFIG = {
  build: { environment: {} },
  plugins: [],
}

// Some properties can be optionally capitalized. We normalize them to lowercase
const normalizePropertiesCase = function({
  Build = {},
  build: {
    Base,
    base = Base,
    Command,
    command = Command,
    Environment,
    environment = Environment,
    Functions,
    functions = Functions,
    Ignore,
    ignore = Ignore,
    Processing,
    processing = Processing,
    Publish,
    publish = Publish,
    ...build
  } = Build,
  ...config
}) {
  const buildA = removeFalsy({ ...build, base, command, environment, functions, ignore, processing, publish })
  return { ...config, build: buildA }
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
