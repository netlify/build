const { dump, JSON_SCHEMA } = require('js-yaml')

const serializeObject = function(object) {
  return dump(object, { schema: JSON_SCHEMA, noRefs: true, sortKeys: true, lineWidth: Infinity }).trimRight()
}

const serializeArray = function(array) {
  return array.map(addDash).join('\n')
}

const addDash = function(string) {
  return ` - ${string}`
}

module.exports = { serializeObject, serializeArray }
