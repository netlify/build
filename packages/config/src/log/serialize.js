const { dump, JSON_SCHEMA } = require('js-yaml')

const serializeObject = function(object) {
  return dump(object, { schema: JSON_SCHEMA, noRefs: true, sortKeys: true, lineWidth: Infinity }).trimRight()
}

module.exports = { serializeObject }
