const {
  env: { NETLIFY_BUILD_SAVE_CACHE },
} = require('process')

const FUNCTIONS_PLUGIN = `${__dirname}/functions.js`
const CACHE_PLUGIN = `${__dirname}/cache.js`

// Plugins that are installed and enabled by default
const CORE_PLUGINS = [
  { package: '@netlify/plugin-functions-core', core: FUNCTIONS_PLUGIN },
  // TODO: remove NETLIFY_BUILD_SAVE_CACHE once integrated in the buildbot
  ...(NETLIFY_BUILD_SAVE_CACHE === '1'
    ? [{ package: '@netlify/plugin-cache-core', core: CACHE_PLUGIN }]
    : // istanbul ignore next
      []),
]

module.exports = { CORE_PLUGINS }
