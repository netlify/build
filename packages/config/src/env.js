const { env } = require('process')

const { set } = require('dot-prop')
const deepmerge = require('deepmerge')

// Find all environment variables starting with `NETLIFY_CONFIG_*` and converts
// them to camelcase options. For example `NETLIFY_CONFIG_FOO_BAR=1` becomes
// `{ fooBar: 1 }`
const addEnvVars = function(config) {
  const envVars = Object.entries(env)
    .filter(isEnvOption)
    .map(([name, value]) => removePrefix(name, value, config))
  return deepmerge.all([...envVars, config])
}

const isEnvOption = function([name]) {
  return name.startsWith(ENV_CONFIG_PREFIX)
}

const removePrefix = function(name, value, config) {
  const nameA = name
    .replace(ENV_CONFIG_PREFIX, '')
    .toLowerCase()
    .replace(/_/g, '.')
  const nameB = fixLegacy(nameA, config)
  const valueA = coerceType(value)
  return set({}, nameB, valueA)
}

const ENV_CONFIG_PREFIX = 'NETLIFY_CONFIG_'

// Allow environment variable options for any JSON types, not only strings
const coerceType = function(value) {
  try {
    return JSON.parse(value)
  } catch (error) {
    return value
  }
}

// We validate that `build.command` and `build.lifecycle.onBuild` are not
// both defined. However the buildbot passes the second one as an environment
// variable. We switch it to the first one if needed to avoid this validation
// error.
const fixLegacy = function(name, config) {
  if (name === 'build.lifecycle.onbuild' && config && config.build && config.build.command) {
    return 'build.command'
  }

  return name
}

module.exports = { addEnvVars }
