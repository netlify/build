const {
  env: { TEST_CACHE_PATH },
} = require('process')

const FUNCTIONS_INSTALL_PLUGIN = `${__dirname}/functions_install/plugin.js`
const FUNCTIONS_PLUGIN = `${__dirname}/functions/plugin.js`
const CACHE_PLUGIN = `${__dirname}/cache/plugin.js`

// Plugins that are installed and enabled by default
const getCorePlugins = FUNCTIONS_SRC => [
  // When no "Functions directory" is defined, it means users does not use
  // Netlify Functions.
  // However when it is defined but points to a non-existing directory, this
  // might mean the directory is created later one, so we cannot do that check
  // yet.
  ...(FUNCTIONS_SRC === undefined
    ? []
    : [{ package: '@netlify/plugin-functions-install-core', location: FUNCTIONS_INSTALL_PLUGIN, core: true }]),
  ...(FUNCTIONS_SRC === undefined
    ? []
    : [{ package: '@netlify/plugin-functions-core', location: FUNCTIONS_PLUGIN, core: true }]),
  // TODO: run only inside tests until integrated in the buildbot
  ...(TEST_CACHE_PATH === undefined || TEST_CACHE_PATH === 'none'
    ? []
    : [{ package: '@netlify/plugin-cache-core', location: CACHE_PLUGIN, core: true }]),
]

const CORE_PLUGINS = [
  '@netlify/plugin-functions-install-core',
  '@netlify/plugin-functions-core',
  '@netlify/plugin-cache-core',
]

module.exports = { getCorePlugins, CORE_PLUGINS }
