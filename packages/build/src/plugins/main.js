const filterObj = require('filter-obj')
const groupBy = require('group-by')

const functionsPlugin = require('../plugins/functions')
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

  const hooks = await Promise.all(pluginsOptionsB.map(pluginOptions => loadPluginHooks(pluginOptions, baseDir)))
  const hooksA = hooks.flat().filter(isNotOverridden)
  const pluginsHooks = groupBy(hooksA, 'hook')
  return pluginsHooks
}

const DEFAULT_PLUGINS = {
  '@netlify/functions': { type: '@netlify/functions', core: functionsPlugin }
}

const normalizePluginOptions = function([pluginId, pluginOptions]) {
  const { type, core, enabled, config: pluginConfig } = Object.assign({}, DEFAULT_PLUGIN_OPTIONS, pluginOptions)
  return { pluginId, type, core, enabled, pluginConfig }
}

const DEFAULT_PLUGIN_OPTIONS = { enabled: true, config: {} }

const isPluginEnabled = function({ enabled }) {
  return String(enabled) !== 'false'
}

const loadPluginHooks = async function({ pluginId, type, core, pluginConfig }, baseDir) {
  const plugin = await importPlugin({ type, core, pluginConfig, pluginId, baseDir })

  validatePlugin(plugin, pluginId)

  const hooks = getPluginHooks(plugin, pluginId, pluginConfig, type)
  return hooks
}

const getPluginHooks = function(plugin, pluginId, pluginConfig, type) {
  const meta = filterObj(plugin, (key, value) => !isPluginHook(key, value))
  const hooks = filterObj(plugin, isPluginHook)
  return Object.entries(hooks).map(([hook, method]) =>
    getPluginHook({ hook, type, method, meta, pluginId, pluginConfig })
  )
}

const isPluginHook = function(key, value) {
  return typeof value === 'function'
}

const getPluginHook = function({ hook, type, method, meta, pluginId, pluginConfig }) {
  const override = getOverride(hook)
  const hookA = override.hook || hook
  return { name: pluginId, hook: hookA, type, method, meta, override, pluginConfig }
}

module.exports = { defaultPlugins: DEFAULT_PLUGINS, getPluginsHooks }
