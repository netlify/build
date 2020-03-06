const isPlainObj = require('is-plain-obj')
const deepmerge = require('deepmerge')

// Merge `config.context.{CONTEXT|BRANCH}.*` to `config.build.*`
// CONTEXT is the `--context` CLI flag.
// BRANCH is the `--branch` CLI flag.
const mergeContext = function({ context: contextProps, build = {}, ...config }, context, branch) {
  if (!isPlainObj(contextProps)) {
    return { ...config, build }
  }

  const contextBuild = contextProps[context]
  const branchBuild = contextProps[branch]
  const buildA = deepmerge.all([build, { ...contextBuild }, { ...branchBuild }], { arrayMerge })
  return { ...config, build: buildA }
}

// By default `deepmerge` concatenates arrays. We use the `arrayMerge` option
// to remove this behavior.
const arrayMerge = function(arrayA, arrayB) {
  return arrayB
}

module.exports = { mergeContext }
