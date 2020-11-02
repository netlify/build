'use strict'

const indentString = require('indent-string')

const { THEME } = require('../log/theme')
const { serializeToml } = require('../utils/toml.js')

// Print invalid value and example netlify.toml
const getExample = function ({ value, key, prevPath, example }) {
  const exampleA = typeof example === 'function' ? example(value, key, prevPath) : example
  return `
${THEME.errorSubHeader('Invalid syntax')}

${indentString(getInvalidValue(value, prevPath), 2)}

${THEME.subHeader('Valid syntax')}

${indentString(serializeToml(exampleA), 2)}`
}

const getInvalidValue = function (value, prevPath) {
  // slice() is temporary, so it does not mutate
  // eslint-disable-next-line fp/no-mutating-methods
  const invalidValue = prevPath.slice().reverse().reduce(setInvalidValuePart, value)
  const invalidValueA = serializeToml(invalidValue)
  return invalidValueA
}

const setInvalidValuePart = function (value, part) {
  if (Number.isInteger(part)) {
    return [value]
  }

  return value === undefined ? {} : { [part]: value }
}

module.exports = { getExample }
