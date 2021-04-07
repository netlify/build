'use strict'

const isPlainObj = require('is-plain-obj')

const { normalizeBeforeConfigMerge } = require('./merge_normalize.js')
const { CONFIG_ORIGIN } = require('./origin')
const { deepMerge } = require('./utils/merge')
const { validatePreContextConfig } = require('./validate/main')

// Takes a config object and adds each key to a namespace. This namespace is
// usually `build`, since `context.*.{key}` is merged to `build.{key}`. The
// only exception to that is for the `functions` key if the value is a plain
// object, so that `context.*.functions.{key}` is merged to `functions.{key}`.
const addNamespace = (context) => {
  const namespacedObject = Object.entries(context).reduce((result, [key, value]) => {
    if (key === 'functions' && isPlainObj(value)) {
      return {
        ...result,
        functions: value,
      }
    }

    return {
      ...result,
      build: {
        ...result.build,
        [key]: value,
      },
    }
  }, {})

  return namespacedObject
}

// Merge `config.context.{CONTEXT|BRANCH}.*` to `config.build.*`
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

  return deepMerge(configA, ...allContextProps)
}

module.exports = { mergeContext }
