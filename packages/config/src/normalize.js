'use strict'

const { normalizeFunctionsProps, normalizeFunctionsLikeProps, WILDCARD_ALL } = require('./functions_config')
const { mergeConfigs } = require('./merge')
const { DEFAULT_ORIGIN } = require('./origin')
const { removeFalsy } = require('./utils/remove_falsy')

// Normalize configuration object
const normalizeConfig = function (config) {
  const configA = removeEmpty(config)
  const { build, functions, builders, plugins, ...configB } = mergeConfigs([DEFAULT_CONFIG, configA])
  const { build: buildA, functions: functionsA, functionsDirectoryProps } = normalizeFunctionsProps(build, functions)
  const buildersA = normalizeFunctionsLikeProps(builders)
  const pluginsA = plugins.map(normalizePlugin)
  return {
    ...configB,
    build: buildA,
    functions: functionsA,
    builders: buildersA,
    plugins: pluginsA,
    ...functionsDirectoryProps,
  }
}

// Remove empty strings.
// This notably ensures that empty strings in the build command are removed.
// Otherwise those would be run during builds, making the build fail.
const removeEmpty = function ({ build, ...config }) {
  return removeFalsy({ ...config, build: removeFalsy(build) })
}

const DEFAULT_CONFIG = {
  build: {
    environment: {},
    publish: '.',
    publishOrigin: DEFAULT_ORIGIN,
    processing: { css: {}, html: {}, images: {}, js: {} },
    services: {},
  },
  functions: { [WILDCARD_ALL]: {} },
  builders: { [WILDCARD_ALL]: {} },
  plugins: [],
}

const normalizePlugin = function ({ inputs = {}, ...plugin }) {
  return removeFalsy({ ...plugin, inputs })
}

module.exports = { normalizeConfig }
