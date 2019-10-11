const { env } = require('process')

const filterObj = require('filter-obj')
const mapObj = require('map-obj')
const camelcaseKeys = require('camelcase-keys')

// Retrieve build options
const getOptions = function(options = {}) {
  const envOptions = getEnvOptions()
  return Object.assign({}, envOptions, options)
}

// Find all environment variables starting with `NETLIFY_BUILD_*` and converts
// them to camelcase options. For example `NETLIFY_BUILD_FOO_BAR=1` becomes
// `{ fooBar: 1 }`
const getEnvOptions = function() {
  const envA = filterObj(env, isEnvOption)
  const envB = mapObj(envA, removePrefix)
  const envC = camelcaseKeys(envB)
  return envC
}

const isEnvOption = function(name) {
  return name.startsWith(ENV_OPTION_PREFIX)
}

const removePrefix = function(name, value) {
  const nameA = name.replace(ENV_OPTION_PREFIX, '')
  const valueA = coerceType(value)
  return [nameA, valueA]
}

const ENV_OPTION_PREFIX = 'NETLIFY_BUILD_'

// Allow environment variable options for any JSON types, not only strings
const coerceType = function(value) {
  try {
    return JSON.parse(value)
  } catch (error) {
    return value
  }
}

module.exports = { getOptions }
