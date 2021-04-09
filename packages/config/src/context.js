'use strict'

const isPlainObj = require('is-plain-obj')

const { normalizeBeforeConfigMerge } = require('./merge_normalize.js')
const { CONFIG_ORIGIN } = require('./origin')
const { mergeConfigs } = require('./utils/merge')
const { validatePreContextConfig } = require('./validate/main')

// Merge `config.context.{CONTEXT|BRANCH}.*` to `config.build.*` or `config.*`
// CONTEXT is the `--context` CLI flag.
// BRANCH is the `--branch` CLI flag.
const mergeContext = function (config, context, branch) {
  validatePreContextConfig(config)

  const { context: contextProps, ...configA } = config
  if (contextProps === undefined) {
    return configA
  }

  const allContextProps = [context, branch]
    .map((key) => contextProps[key])
    .filter(Boolean)
    .map(addNamespace)
    .map((contextConfig) => normalizeBeforeConfigMerge(contextConfig, CONFIG_ORIGIN))

  return mergeConfigs([configA, ...allContextProps])
}

// `config.context.{context}.*` properties are merged either to `config.*` or
// to `config.build.*`. We distinguish between both by checking the property
// name.
const addNamespace = (contextProps) => Object.entries(contextProps).reduce(addNamespacedProperty, {})

const addNamespacedProperty = function (contextProps, [key, value]) {
  return isBuildProperty(key, value)
    ? { ...contextProps, build: { ...contextProps.build, [key]: value } }
    : { ...contextProps, [key]: value }
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
