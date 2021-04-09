'use strict'

const deepmerge = require('deepmerge')
const isPlainObj = require('is-plain-obj')

const { groupBy } = require('./group')

// Merge an array of configuration objects.
// Last items have higher priority.
// Configuration objects are deeply merged.
//   - Arrays are overridden, not concatenated.
const mergeConfigs = function (configs) {
  return deepmerge.all(configs, { arrayMerge })
}

// By default `deepmerge` concatenates arrays. We use the `arrayMerge` option
// to remove this behavior. Also, we merge some array properties differently,
// such as `plugins`.
const arrayMerge = function (arrayA, arrayB) {
  if (isPluginsProperty(arrayA) && isPluginsProperty(arrayB)) {
    return mergePlugins(arrayA, arrayB)
  }

  return arrayB
}

// `deepmerge` does not allow retrieving the name of the array property being
// merged, so we need to do some heuristics.
const isPluginsProperty = function (array) {
  return Array.isArray(array) && array.every(isPluginObject)
}

const isPluginObject = function (object) {
  return isPlainObj(object) && typeof object.package === 'string'
}

// Merge two `config.plugins`. Merge plugins with the same `plugin.package`.
const mergePlugins = function (pluginsA, pluginsB) {
  const plugins = [...pluginsA, ...pluginsB]
  return groupBy(plugins, 'package').map(mergePluginConfigs)
}

const mergePluginConfigs = function (plugins) {
  return plugins.reduce(mergePluginsPair, {})
}

const mergePluginsPair = function (pluginA, pluginB) {
  return deepmerge(pluginA, pluginB, { arrayMerge })
}

module.exports = { mergeConfigs }
