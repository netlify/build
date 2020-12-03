'use strict'

const addExpectedVersions = function ({ pluginsOptions }) {
  if (!pluginsOptions.some(isAutoPlugin)) {
    return pluginsOptions
  }

  return pluginsOptions.map(addExpectedVersionUnlessPath)
}

const isAutoPlugin = function ({ loadedFrom }) {
  return loadedFrom === 'auto_install'
}

const addExpectedVersionUnlessPath = function ({ pluginPath, ...pluginOptions }) {
  if (pluginPath !== undefined) {
    return { ...pluginOptions, pluginPath }
  }

  return { ...pluginOptions, expectedVersion: 'latest' }
}

module.exports = { addExpectedVersions }
