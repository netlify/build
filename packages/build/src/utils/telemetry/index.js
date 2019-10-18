const Analytics = require('analytics').default

const pkg = require('../../../package.json')

const plugins = require('./plugins')

/* If DEBUG true, disable telemetry api calls */
const DEBUG_ENABLED = false

const telemetry = Analytics({
  app: 'netlifyCI',
  debug: DEBUG_ENABLED,
  version: pkg.version,
  plugins: plugins,
})

module.exports = telemetry
