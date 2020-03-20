const {
  env: { NETLIFY_BUILD_SAVE_CACHE },
} = require('process')

const FUNCTIONS_PLUGIN = `${__dirname}/functions/plugin.js`
const CACHE_PLUGIN = `${__dirname}/cache/plugin.js`

// Plugins that are installed and enabled by default
const CORE_PLUGINS = [
  { package: '@netlify/plugin-functions-core', location: FUNCTIONS_PLUGIN, core: true },
  // TODO: remove NETLIFY_BUILD_SAVE_CACHE once integrated in the buildbot
  ...(NETLIFY_BUILD_SAVE_CACHE === '1'
    ? [{ package: '@netlify/plugin-cache-core', location: CACHE_PLUGIN, core: true }]
    : // istanbul ignore next
      []),
]

module.exports = { CORE_PLUGINS }
