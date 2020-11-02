'use strict'

const { dump } = require('js-yaml')

const serializeObject = function (object) {
  return dump(object, { noRefs: true, sortKeys: true, lineWidth: Infinity }).trimRight()
}

module.exports = { serializeObject }
