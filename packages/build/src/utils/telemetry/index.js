const Analytics = require('analytics').default

const pkg = require('../../../package.json')

const plugins = require('./plugins')

// AVA_TESTING_ENV set by ava testing config
const { AVA_TESTING_ENV, BUILD_TELEMETRY_DISABLED } = process.env

/* If BUILD_TELEMETRY_DISABLED, disable api calls */
const activePlugins = BUILD_TELEMETRY_DISABLED || AVA_TESTING_ENV ? [] : plugins

/* If DEBUG true, disable telemetry api calls */
const DEBUG_ENABLED = false

const telemetry = Analytics({
  app: 'netlifyCI',
  debug: DEBUG_ENABLED,
  version: pkg.version,
  plugins: activePlugins
})

module.exports = telemetry
