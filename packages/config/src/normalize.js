'use strict'

const { deepMerge } = require('./utils/merge')
const { removeFalsy } = require('./utils/remove_falsy')

// Normalize configuration object
const normalizeConfig = function (config) {
  const { build, plugins, ...configA } = deepMerge(DEFAULT_CONFIG, config)
  const pluginsA = plugins.map(normalizePlugin)
  return { ...configA, build, plugins: pluginsA }
}

const DEFAULT_CONFIG = {
  build: { environment: {} },
  plugins: [],
}

const normalizePlugin = function ({ package: packageName, inputs = {}, origin, ...plugin }) {
  return removeFalsy({ ...plugin, package: packageName, inputs, origin })
}

module.exports = { normalizeConfig }
