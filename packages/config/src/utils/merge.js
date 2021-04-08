'use strict'

const deepmerge = require('deepmerge')

// Merge an array of configuration objects.
// Last items have higher priority.
// Configuration objects are deeply merged.
//   - Arrays are overridden, not concatenated.
const mergeConfigs = function (configs) {
  return deepmerge.all(configs, { arrayMerge })
}

// By default `deepmerge` concatenates arrays. We use the `arrayMerge` option
// to remove this behavior.
const arrayMerge = function (arrayA, arrayB) {
  return arrayB
}

module.exports = { mergeConfigs }
