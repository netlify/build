'use strict'

const isPlainObj = require('is-plain-obj')

const { normalizeBuildCase } = require('./case')
const { addCommandConfigOrigin } = require('./origin')
const { deepMerge } = require('./utils/merge')

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
const mergeContext = function ({ context: contextProps, ...config }, context, branch) {
  if (!isPlainObj(contextProps)) {
    return config
  }

  const allContextProps = [context, branch]
    .map((key) => contextProps[key])
    .filter(Boolean)
    .map(normalizeBuildCase)
    .map(addCommandConfigOrigin)
    .map(addNamespace)

  return deepMerge(config, ...allContextProps)
}

module.exports = { mergeContext }
