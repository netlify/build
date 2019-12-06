const { env } = require('process')

const { set } = require('dot-prop')
const deepmerge = require('deepmerge')

// Find all environment variables starting with `NETLIFY_CONFIG_*` and converts
// them to camelcase options. For example `NETLIFY_CONFIG_FOO_BAR=1` becomes
// `{ fooBar: 1 }`
const addEnvVars = function(config) {
  const envVars = Object.entries(env)
    .filter(isEnvOption)
    .map(removePrefix)
  const envVarsConfig = deepmerge.all(envVars)
  return { ...envVarsConfig, ...config }
}

const isEnvOption = function([name]) {
  return name.startsWith(ENV_CONFIG_PREFIX)
}

const removePrefix = function([name, value]) {
  const nameA = name
    .replace(ENV_CONFIG_PREFIX, '')
    .toLowerCase()
    .replace(/_/g, '.')
  const nameB = fixLegacy(nameA)
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

// This is due to https://github.com/netlify/buildbot/pull/513/files#diff-16120d2ef3dd18199ee88957bb11cf51R58
// to prevent warning messages from being printed.
// TODO: remove this once the buildbot has been updated to using
// `NETLIFY_CONFIG_BUILD_LIFECYCLE_ONBUILD` instead of
// `NETLIFY_CONFIG_BUILD_LIFECYCLE_BUILD`.
const fixLegacy = function(name) {
  if (name === 'build.lifecycle.build') {
    return 'build.lifecycle.onbuild'
  }

  return name
}

module.exports = { addEnvVars }
