// Turn [1, 2, 3] into "1", "2", "3"
const serializeList = function(array) {
  return array.map(quote).join(', ')
}

const quote = function(string) {
  return `"${string}"`
}

module.exports = { serializeList }
