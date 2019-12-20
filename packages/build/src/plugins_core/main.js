const {
  env: { NETLIFY_BUILD_SAVE_CACHE },
} = require('process')

const FUNCTIONS_PLUGIN = `${__dirname}/functions.js`
const CACHE_PLUGIN = `${__dirname}/cache.js`

// Plugins that are installed and enabled by default
const CORE_PLUGINS = [
  { id: '@netlify/plugin-functions-core', package: FUNCTIONS_PLUGIN, core: true },
  // TODO: remove NETLIFY_BUILD_SAVE_CACHE once integrated in the buildbot
  ...(NETLIFY_BUILD_SAVE_CACHE === '1'
    ? [{ id: '@netlify/plugin-cache-core', package: CACHE_PLUGIN, core: true }]
    : // istanbul ignore next
      []),
]

module.exports = { CORE_PLUGINS }
