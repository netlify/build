const isPlainObj = require('is-plain-obj')
const deepmerge = require('deepmerge')

// Merge `config.context.{CONTEXT}.*` to `config.build.*`
// CONTEXT is the `--context` CLI flag.
const mergeContext = function({ context: contextProps, build = {}, ...config }, context) {
  if (!isPlainObj(contextProps)) {
    return { ...config, build }
  }

  const contextBuild = contextProps[context]
  const buildA = deepmerge.all([build, { ...contextBuild }], { arrayMerge })
  return { ...config, build: buildA }
}

// By default `deepmerge` concatenates arrays. We use the `arrayMerge` option
// to remove this behavior.
const arrayMerge = function(arrayA, arrayB) {
  return arrayB
}

module.exports = { mergeContext }
