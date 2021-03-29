'use strict'

const indentString = require('indent-string')

const { THEME } = require('../log/theme')
const { serializeToml } = require('../utils/toml.js')

// Print invalid value and example netlify.toml
const getExample = function ({ value, key, prevPath, example, formatInvalid }) {
  const exampleA = typeof example === 'function' ? example(value, key, prevPath) : example
  return `
${THEME.errorSubHeader('Invalid syntax')}

${indentString(getInvalidValue(value, prevPath, formatInvalid), 2)}

${THEME.subHeader('Valid syntax')}

${indentString(serializeToml(exampleA), 2)}`
}

const getInvalidValue = function (value, prevPath, formatInvalid) {
  // slice() is temporary, so it does not mutate
  // eslint-disable-next-line fp/no-mutating-methods
  const invalidValue = [...prevPath].reverse().reduce(setInvalidValuePart, value)

  // If `formatInvalid` is supplied, we use it to format the invalid value
  // before serializing it to TOML and printing it.
  const formattedInvalidValue = typeof formatInvalid === 'function' ? formatInvalid(invalidValue) : invalidValue
  const invalidValueA = serializeToml(formattedInvalidValue)
  return invalidValueA
}

const setInvalidValuePart = function (value, part) {
  if (Number.isInteger(part)) {
    return [value]
  }

  return value === undefined ? {} : { [part]: value }
}

module.exports = { getExample }
