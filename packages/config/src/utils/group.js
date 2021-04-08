'use strict'

// Group objects according to a key attribute.
// The key must exist in each object and be a string.
const groupBy = function (objects, keyName) {
  const keys = [...new Set(objects.map((object) => object[keyName]))]
  return keys.map((key) => groupObjects(objects, keyName, key))
}

const groupObjects = function (objects, keyName, key) {
  return objects.filter((object) => object[keyName] === key)
}

module.exports = { groupBy }
