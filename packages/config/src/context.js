const isPlainObj = require('is-plain-obj')

const { deepMerge } = require('./utils/merge')

// Merge `config.context.{CONTEXT|BRANCH}.*` to `config.build.*`
// CONTEXT is the `--context` CLI flag.
// BRANCH is the `--branch` CLI flag.
const mergeContext = function({ context: contextProps, ...config }, context, branch) {
  if (!isPlainObj(contextProps)) {
    return config
  }

  const build = deepMerge(config.build, contextProps[context], contextProps[branch])
  return { ...config, build }
}

module.exports = { mergeContext }
