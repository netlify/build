const indentString = require('indent-string')
const tomlify = require('tomlify-j0.4')

// Print invalid value and example netlify.toml
const getExample = function({ value, key, prevPath, example }) {
  const exampleA = typeof example === 'function' ? example(value, key, prevPath) : example
  return `
Invalid syntax

${indentString(getInvalidValue(value, prevPath), 2)}

Valid syntax

${indentString(serializeValue(exampleA), 2)}`
}

const getInvalidValue = function(value, prevPath) {
  const invalidValue = prevPath.reverse().reduce(setInvalidValuePart, value)
  const invalidValueA = serializeValue(invalidValue)
  return invalidValueA
}

const setInvalidValuePart = function(value, part) {
  if (Number.isInteger(part)) {
    return [value]
  }

  return value === undefined ? {} : { [part]: value }
}

// Serialize JavaScript object to TOML
const serializeValue = function(object) {
  return tomlify.toToml(object, { space: 2 })
}

module.exports = { getExample }
