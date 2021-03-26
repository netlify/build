'use strict'

const { listCorePlugins, isCorePlugin } = require('./list')

// Add core plugins and user plugins together.
// Do not allow user override of core plugins.
const addCorePlugins = function ({ netlifyConfig: { plugins }, constants, featureFlags, childEnv }) {
  const corePlugins = listCorePlugins({ constants, featureFlags, childEnv })
  const allCorePlugins = corePlugins
    .map((corePlugin) => addCoreProperties(corePlugin, plugins))
    .filter((corePlugin) => !isOptionalCore(corePlugin, plugins))
  const userPlugins = plugins.filter(isUserPlugin)
  const allPlugins = [...userPlugins, ...allCorePlugins]
  const pluginsOptions = allPlugins.map(normalizePluginOptions)
  return pluginsOptions
}

const addCoreProperties = function (corePlugin, plugins) {
  const inputs = getCorePluginInputs(corePlugin, plugins)
  return { ...corePlugin, inputs, loadedFrom: 'core', origin: 'core' }
}

// Core plugins can get inputs too
const getCorePluginInputs = function (corePlugin, plugins) {
  const configuredCorePlugin = plugins.find((plugin) => plugin.package === corePlugin.package)
  if (configuredCorePlugin === undefined) {
    return {}
  }

  return configuredCorePlugin.inputs
}

// Optional core plugins requires user opt-in
const isOptionalCore = function (pluginA, plugins) {
  return pluginA.optional && plugins.every((pluginB) => pluginB.package !== pluginA.package)
}

const isUserPlugin = function (plugin) {
  return !isCorePlugin(plugin.package)
}

const normalizePluginOptions = function ({ package: packageName, pluginPath, loadedFrom, origin, inputs }) {
  return { packageName, pluginPath, loadedFrom, origin, inputs }
}

module.exports = { addCorePlugins }
