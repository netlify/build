const {
  env: { TEST_CACHE_PATH },
} = require('process')

const FUNCTIONS_INSTALL_PLUGIN = `${__dirname}/functions_install/plugin.js`
const FUNCTIONS_PLUGIN = `${__dirname}/functions/plugin.js`
const CACHE_PLUGIN = `${__dirname}/cache/plugin.js`

const { LOCAL_INSTALL_NAME } = require('../install/local')

// Plugins that are installed and enabled by default
const getCorePlugins = FUNCTIONS_SRC => [
  // When no "Functions directory" is defined, it means users does not use
  // Netlify Functions.
  // However when it is defined but points to a non-existing directory, this
  // might mean the directory is created later one, so we cannot do that check
  // yet.
  ...(FUNCTIONS_SRC === undefined
    ? []
    : [{ package: '@netlify/plugin-functions-install-core', pluginPath: FUNCTIONS_INSTALL_PLUGIN, optional: true }]),
  ...(FUNCTIONS_SRC === undefined ? [] : [{ package: '@netlify/plugin-functions-core', pluginPath: FUNCTIONS_PLUGIN }]),
  // TODO: run only inside tests until integrated in the buildbot
  ...(TEST_CACHE_PATH === undefined || TEST_CACHE_PATH === 'none'
    ? []
    : [{ package: '@netlify/plugin-cache-core', pluginPath: CACHE_PLUGIN }]),
]

const CORE_PLUGINS = [
  '@netlify/plugin-functions-install-core',
  '@netlify/plugin-functions-core',
  '@netlify/plugin-cache-core',
]

// Those core plugins cannot be handled like regular plugins because they must
// be run before plugin child processes start
const EARLY_CORE_PLUGINS = [LOCAL_INSTALL_NAME]

module.exports = { getCorePlugins, CORE_PLUGINS, EARLY_CORE_PLUGINS }
