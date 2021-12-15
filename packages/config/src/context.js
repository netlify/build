import isPlainObj from 'is-plain-obj'
import mapObj from 'map-obj'

import { mergeConfigs } from './merge.js'
import { normalizeBeforeConfigMerge } from './merge_normalize.js'
import { validateContextsPluginsConfig } from './validate/context.js'
import { validatePreContextConfig } from './validate/main.js'

// Validate and normalize `config.context.*`
export const normalizeContextProps = function ({ config, config: { context: contextProps }, origin }) {
  if (contextProps === undefined) {
    return config
  }

  validatePreContextConfig(config)

  const allContextProps = mapObj(contextProps, (key, contextConfig) => [key, addNamespace(contextConfig)])
  const normalizedContextProps = mapObj(allContextProps, (key, contextConfig) => [
    key,
    normalizeBeforeConfigMerge(contextConfig, origin),
  ])
  return { ...config, context: normalizedContextProps }
}

// Merge `config.context.{CONTEXT|BRANCH}.*` to `config.build.*` or `config.*`
// CONTEXT is the `--context` CLI flag.
// BRANCH is the `--branch` CLI flag.
export const mergeContext = function ({
  config: { context: contextProps, ...config },
  config: { plugins },
  context,
  branch,
  logs,
}) {
  if (contextProps === undefined) {
    return config
  }

  const contexts = [context, branch]
  validateContextsPluginsConfig({ contextProps, plugins, contexts, logs })
  const filteredContextProps = contexts.map((key) => contextProps[key]).filter(Boolean)
  return mergeConfigs([config, ...filteredContextProps])
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
  return BUILD_PROPERTIES.has(key) && !isFunctionsConfig(key, value) && !isEdgeHandlersConfig(key, value)
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

// `config.edge_handlers` is an array of objects while
// `config.build.edge_handlers` is a string.
const isEdgeHandlersConfig = function (key, value) {
  return key === 'edge_handlers' && Array.isArray(value)
}

// Ensure that `inlineConfig` has higher priority than context properties by
// assigining it to `context.*`. Still keep it at the top-level as well since
// some properties are not handled context-sensitively by the API.
// Takes into account that `context.{context}.build.*` is the same as
// `context.{context}.*`
export const ensureConfigPriority = function ({ build = {}, ...config }, context, branch) {
  return {
    ...config,
    build,
    context: {
      ...config.context,
      [context]: { ...config, ...build, build },
      [branch]: { ...config, ...build, build },
    },
  }
}
