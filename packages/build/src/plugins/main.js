const filterObj = require('filter-obj')
const groupBy = require('group-by')

const { logLoadPlugins } = require('../log/main')

const { importPlugin } = require('./import')
const { validatePlugin } = require('./validate')
const { getOverride, isNotOverridden } = require('./override')

// Retrieve plugin lifecycle hooks
const getPluginsHooks = async function({ config: { plugins: pluginsOptions }, baseDir }) {
  logLoadPlugins()
  const pluginsOptionsA = Object.assign({}, DEFAULT_PLUGINS, pluginsOptions)
  const pluginsOptionsB = Object.entries(pluginsOptionsA)
    .map(normalizePluginOptions)
    .filter(isPluginEnabled)

  const plugins = await loadPlugins(pluginsOptionsB, baseDir)
  const hooksA = plugins.flatMap(getPluginHooks).filter(isNotOverridden)
  const pluginsHooks = groupBy(hooksA, 'hook')
  return pluginsHooks
}

const DEFAULT_PLUGINS = {
  '@netlify/functions': { type: `${__dirname}/functions/index.js` }
}

const normalizePluginOptions = function([pluginId, pluginOptions]) {
  const { type, enabled, config: pluginConfig } = Object.assign({}, DEFAULT_PLUGIN_OPTIONS, pluginOptions)
  return { pluginId, type, enabled, pluginConfig }
}

const DEFAULT_PLUGIN_OPTIONS = { enabled: true, config: {} }

const isPluginEnabled = function({ enabled }) {
  return String(enabled) !== 'false'
}

const loadPlugins = async function(pluginsOptions, baseDir) {
  const plugins = await Promise.all(pluginsOptions.map(pluginOptions => loadPlugin(pluginOptions, baseDir)))
  return plugins.flat()
}

const loadPlugin = async function({ pluginId, type, pluginConfig }, baseDir) {
  const plugin = await importPlugin({ type, pluginConfig, pluginId, baseDir })

  if (Array.isArray(plugin)) {
    return plugin.flat(Infinity).map(nestedPlugin => ({ plugin: nestedPlugin, pluginId, pluginConfig, type }))
  }

  return { plugin, pluginId, pluginConfig, type }
}

const getPluginHooks = function({ plugin, pluginId, pluginConfig, type }) {
  validatePlugin(plugin, pluginId)

  const meta = filterObj(plugin, (key, value) => !isPluginHook(key, value))
  const hooks = filterObj(plugin, isPluginHook)
  return Object.entries(hooks).map(([hook, method]) =>
    getPluginHook({ hook, type, method, meta, pluginId, pluginConfig })
  )
}

const isPluginHook = function(key, value) {
  return typeof value === 'function'
}

const getPluginHook = function({
  hook,
  type,
  method,
  meta,
  meta: { scopes = DEFAULT_SCOPES },
  pluginId,
  pluginConfig
}) {
  const metaA = Object.assign({}, meta, { scopes })
  const override = getOverride(hook)
  const hookA = override.hook || hook
  return { name: pluginId, hook: hookA, type, method, meta: metaA, override, pluginConfig }
}

const DEFAULT_SCOPES = []

module.exports = { defaultPlugins: DEFAULT_PLUGINS, getPluginsHooks }
