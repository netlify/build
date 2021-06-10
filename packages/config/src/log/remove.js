'use strict'

const isPlainObj = require('is-plain-obj')

const { removeFalsy } = require('../utils/remove_falsy')

const removeEmptyObject = function (object, propName) {
  if (!isPlainObj(object)) {
    return {}
  }

  const objectA = removeFalsy(object)
  return Object.keys(objectA).length === 0 ? {} : { [propName]: objectA }
}

const removeEmptyArray = function (array, propName) {
  if (!Array.isArray(array)) {
    return {}
  }

  return array.length === 0 ? {} : { [propName]: array }
}

module.exports = { removeEmptyObject, removeEmptyArray }
