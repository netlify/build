const Analytics = require('analytics').default

const pkg = require('../../../package.json')

const plugins = require('./plugins')

/* If BUILD_TELEMETRY_DISABLED, disable api calls */
const activePlugins = process.env.BUILD_TELEMETRY_DISABLED ? [] : plugins

/* If DEBUG true, disable telemetry api calls */
const DEBUG_ENABLED = false

const telemetry = Analytics({
  app: 'netlifyCI',
  debug: DEBUG_ENABLED,
  version: pkg.version,
  plugins: activePlugins
})

module.exports = telemetry
