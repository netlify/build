'use strict'

const filterObj = require('filter-obj')

// Remove falsy values from object
const removeFalsy = function (obj) {
  return filterObj(obj, (key, value) => isTruthy(value))
}

const removeUndefined = function (obj) {
  return filterObj(obj, (key, value) => isDefined(value))
}

const isTruthy = function (value) {
  return isDefined(value) && (typeof value !== 'string' || value.trim() !== '')
}

const isDefined = function (value) {
  return value !== undefined && value !== null
}

module.exports = { removeFalsy, removeUndefined, isTruthy, isDefined }
