const filterObj = require('filter-obj')
const groupBy = require('group-by')
const chalk = require('chalk')

const netlifyFunctionsPlugin = require('../plugins/functions')
const { HEADING_PREFIX } = require('../build/constants')

const { importPlugin } = require('./import')
const { validatePlugin } = require('./validate')
const { getOverride, isNotOverridden } = require('./override')

// Retrieve plugin lifecycle hooks
const getPluginsHooks = function({ config: { plugins = [] }, baseDir }) {
  const pluginsA = [...DEFAULT_PLUGINS, ...plugins]

  console.log(chalk.cyanBright.bold(`${HEADING_PREFIX} Loading plugins`))

  const hooksArray = pluginsA
    .map(normalizePlugin)
    .filter(isPluginEnabled)
    .flatMap(pluginConfig => getPluginHooks({ pluginConfig, baseDir }))
    .filter(isNotOverridden)
  const pluginsHooks = groupBy(hooksArray, 'hook')
  return pluginsHooks
}

const DEFAULT_PLUGINS = [netlifyFunctionsPlugin]

// Userland plugins and core plugins have a different shape
const normalizePlugin = function(plugin) {
  if (plugin.core) {
    return plugin
  }

  const [name] = Object.keys(plugin)
  const pluginConfig = plugin[name]
  return { ...pluginConfig, name }
}

const isPluginEnabled = function({ enabled }) {
  return String(enabled) !== 'false'
}

const getPluginHooks = function({ pluginConfig, pluginConfig: { core, name }, baseDir }) {
  const plugin = loadPlugin(pluginConfig, core, name, baseDir)

  // TODO: validate allowed characters in `plugin` properties
  validatePlugin(plugin, name)

  const meta = filterObj(plugin, isPluginMeta)

  return Object.entries(plugin)
    .filter(isPluginHook)
    .map(([hook, method]) => getPluginHook({ hook, method, name, pluginConfig, meta }))
}

const loadPlugin = function(pluginConfig, core, name, baseDir) {
  console.log(chalk.yellowBright(`Loading plugin "${name}"`))

  const code = core ? pluginConfig : importPlugin(name, baseDir)

  if (typeof code !== 'function') {
    return code
  }

  return code(pluginConfig)
}

const isPluginMeta = function(key, value) {
  return typeof value !== 'function'
}

const isPluginHook = function([, value]) {
  return typeof value === 'function'
}

const getPluginHook = function({ hook, method, name, pluginConfig, meta }) {
  const override = getOverride(hook)
  return { name, hook: override.hook || hook, pluginConfig, meta, method, override }
}

module.exports = { defaultPlugins: DEFAULT_PLUGINS, getPluginsHooks }
