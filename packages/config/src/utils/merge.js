'use strict'

const deepmerge = require('deepmerge')
const isPlainObj = require('is-plain-obj')

// Deep merge utility for configuration objects
const deepMerge = function (...values) {
  const objects = values.filter(isPlainObj)
  return deepmerge.all(objects, { arrayMerge })
}

// By default `deepmerge` concatenates arrays. We use the `arrayMerge` option
// to remove this behavior.
const arrayMerge = function (arrayA, arrayB) {
  return arrayB
}

module.exports = { deepMerge }
