// Turn [1, 2, 3] into:
//  - 1
//  - 2
//  - 3
const serializeList = function(array) {
  return array.map(addDash).join('\n')
}

const addDash = function(string) {
  return ` - ${string}`
}

module.exports = { serializeList }
