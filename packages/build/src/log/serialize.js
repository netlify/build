'use strict'

const { dump } = require('js-yaml')

const serializeObject = function (object) {
  return dump(object, { noRefs: true, sortKeys: true, lineWidth: Infinity }).trimRight()
}

const serializeArray = function (array) {
  return array.map(addDash).join('\n')
}

const addDash = function (string) {
  return ` - ${string}`
}

module.exports = { serializeObject, serializeArray }
