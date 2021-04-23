'use strict'

const isPlainObj = require('is-plain-obj')
const mapObj = require('map-obj')

const { normalizeBeforeConfigMerge } = require('./merge_normalize.js')
const { CONFIG_ORIGIN } = require('./origin')
const { mergeConfigs } = require('./utils/merge')
const { validateContextsPluginsConfig } = require('./validate/context')
const { validatePreContextConfig } = require('./validate/main')

// Merge `config.context.{CONTEXT|BRANCH}.*` to `config.build.*` or `config.*`
// CONTEXT is the `--context` CLI flag.
// BRANCH is the `--branch` CLI flag.
const mergeContext = function ({ config, context, branch, logs }) {
  validatePreContextConfig(config)

  const { context: contextProps, ...configA } = config
  if (contextProps === undefined) {
    return configA
  }

  const allContextProps = mapObj(contextProps, (key, contextConfig) => [key, addNamespace(contextConfig)])
  const normalizedContextProps = mapObj(allContextProps, (key, contextConfig) => [
    key,
    normalizeBeforeConfigMerge(contextConfig, CONFIG_ORIGIN),
  ])
  const contexts = [context, branch]
  validateContextsPluginsConfig({ normalizedContextProps, config: configA, contexts, logs })
  const filteredContextProps = contexts.map((key) => normalizedContextProps[key]).filter(Boolean)

  return mergeConfigs([configA, ...filteredContextProps])
}

// `config.context.{context}.*` properties are merged either to `config.*` or
// to `config.build.*`. We distinguish between both by checking the property
// name.
const addNamespace = (contextConfig) => Object.entries(contextConfig).reduce(addNamespacedProperty, {})

const addNamespacedProperty = function (contextConfig, [key, value]) {
  return isBuildProperty(key, value)
    ? { ...contextConfig, build: { ...contextConfig.build, [key]: value } }
    : { ...contextConfig, [key]: value }
}

const isBuildProperty = function (key, value) {
  return BUILD_PROPERTIES.has(key) && !isFunctionsConfig(key, value)
}

// All properties in `config.build.*`
const BUILD_PROPERTIES = new Set([
  'base',
  'command',
  'edge_handlers',
  'environment',
  'functions',
  'ignore',
  'processing',
  'publish',
])

// `config.functions` is a plain object while `config.build.functions` is a
// string.
const isFunctionsConfig = function (key, value) {
  return key === 'functions' && isPlainObj(value)
}

module.exports = { mergeContext }
