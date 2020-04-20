const indentString = require('indent-string')

const { serializeToml } = require('../utils/toml.js')

// Print invalid value and example netlify.toml
const getExample = function({ value, key, prevPath, example }) {
  const exampleA = typeof example === 'function' ? example(value, key, prevPath) : example
  return `
Invalid syntax

${indentString(getInvalidValue(value, prevPath), 2)}

Valid syntax

${indentString(serializeToml(exampleA), 2)}`
}

const getInvalidValue = function(value, prevPath) {
  const invalidValue = prevPath.reverse().reduce(setInvalidValuePart, value)
  const invalidValueA = serializeToml(invalidValue)
  return invalidValueA
}

const setInvalidValuePart = function(value, part) {
  if (Number.isInteger(part)) {
    return [value]
  }

  return value === undefined ? {} : { [part]: value }
}

module.exports = { getExample }
