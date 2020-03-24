const {
  env: { TEST_CACHE_PATH },
} = require('process')

const FUNCTIONS_PLUGIN = `${__dirname}/functions/plugin.js`
const CACHE_PLUGIN = `${__dirname}/cache/plugin.js`

// Plugins that are installed and enabled by default
const CORE_PLUGINS = [
  { package: '@netlify/plugin-functions-core', location: FUNCTIONS_PLUGIN, core: true },
  // TODO: run only inside tests until integrated in the buildbot
  ...(TEST_CACHE_PATH !== undefined && TEST_CACHE_PATH !== 'none'
    ? [{ package: '@netlify/plugin-cache-core', location: CACHE_PLUGIN, core: true }]
    : []),
]

module.exports = { CORE_PLUGINS }
