const Analytics = require('analytics').default

const pkg = require('../../package.json')

const plugins = require('./plugins')

/* If DEBUG true, disable telemetry api calls */
const DEBUG_ENABLED = false

const telemetry = Analytics({
  app: 'netlifyCI',
  debug: DEBUG_ENABLED,
  version: pkg.version,
  plugins: plugins,
})

// Send telemetry request when build completes
const trackBuildComplete = async function({ instructionsCount, config, duration, options }) {
  const payload = getPayload({ instructionsCount, config, duration, options })
  await telemetry.track('buildComplete', payload)
}

const getPayload = function({ instructionsCount, config, duration, options: { siteId } }) {
  const plugins = Object.values(config.plugins).map(getPluginType)
  return { steps: instructionsCount, duration, pluginCount: plugins.length, plugins, siteId }
}

const getPluginType = function({ type }) {
  return type
}

module.exports = { trackBuildComplete }
