'use strict'

const isPlainObj = require('is-plain-obj')

const { normalizeBuildCase } = require('./case')
const { addCommandConfigOrigin } = require('./origin')
const { deepMerge } = require('./utils/merge')

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
  const build = deepMerge(config.build, ...allContextProps)
  return { ...config, build }
}

module.exports = { mergeContext }
