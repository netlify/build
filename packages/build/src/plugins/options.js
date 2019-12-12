const {
  env: { NETLIFY_BUILD_SAVE_CACHE },
} = require('process')
const { promisify } = require('util')

const resolve = require('resolve')

const pResolve = promisify(resolve)

const FUNCTIONS_PLUGIN = `${__dirname}/functions/index.js`
const CACHE_PLUGIN = `${__dirname}/../cache/plugin.js`

// Load plugin options (specified by user in `config.plugins`)
const getPluginsOptions = async function({ plugins: pluginsOptions }, baseDir) {
  const pluginsOptionsA = [...DEFAULT_PLUGINS, ...pluginsOptions].map(normalizePluginOptions).filter(isPluginEnabled)
  const pluginsOptionsB = await Promise.all(pluginsOptionsA.map(pluginOptions => resolvePlugin(pluginOptions, baseDir)))
  return pluginsOptionsB
}

const DEFAULT_PLUGINS = [
  { id: '@netlify/plugin-functions-core', type: FUNCTIONS_PLUGIN, core: true },
  ...(NETLIFY_BUILD_SAVE_CACHE === '1' ? [{ id: '@netlify/plugin-cache-core', type: CACHE_PLUGIN, core: true }] : []),
]

const normalizePluginOptions = function(pluginOptions) {
  const { id, type, core, enabled, config: pluginConfig } = {
    ...DEFAULT_PLUGIN_OPTIONS,
    ...pluginOptions,
  }
  return { id, type, core, enabled, pluginConfig }
}

const DEFAULT_PLUGIN_OPTIONS = { enabled: true, core: false, config: {} }

const isPluginEnabled = function({ enabled }) {
  return String(enabled) !== 'false'
}

// We use `resolve` because `require()` should be relative to `baseDir` not to
// this `__filename`
const resolvePlugin = async function({ type, ...pluginOptions }, baseDir) {
  try {
    const pluginPath = await pResolve(type, { basedir: baseDir })
    return { ...pluginOptions, type, pluginPath }
  } catch (error) {
    error.message = `'${type}' plugin not installed or found\n${error.message}`
    throw error
  }
}

module.exports = { getPluginsOptions }
