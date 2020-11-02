'use strict'

const { removeFalsy } = require('../utils/remove_falsy')

const removeEmptyObject = function (object, propName) {
  const objectA = removeFalsy(object)
  return Object.keys(objectA).length === 0 ? {} : { [propName]: objectA }
}

const removeEmptyArray = function (array, propName) {
  return array.length === 0 ? {} : { [propName]: array }
}

module.exports = { removeEmptyObject, removeEmptyArray }
