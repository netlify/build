const { promisify } = require('util')

const resolve = require('resolve')

const { CORE_PLUGINS } = require('../plugins_core/main')

const pResolve = promisify(resolve)

// Load plugin options (specified by user in `config.plugins`)
const getPluginsOptions = async function({ plugins: pluginsOptions }, baseDir) {
  const pluginsOptionsA = [...CORE_PLUGINS, ...pluginsOptions].map(normalizePluginOptions).filter(isPluginEnabled)
  const pluginsOptionsB = await Promise.all(pluginsOptionsA.map(pluginOptions => resolvePlugin(pluginOptions, baseDir)))
  return pluginsOptionsB
}

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
