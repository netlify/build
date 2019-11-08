const { dump } = require('js-yaml')
const indentString = require('indent-string')
const { red, green } = require('chalk')

// Print invalid value and example netlify.yml
const getExample = function({ value, prevPath, example }) {
  return `
${red.bold('Invalid syntax')}

${indentString(getInvalidValue(value, prevPath), 2)}

${green.bold('Valid syntax')}

${indentString(serializeValue(example), 2)}`
}

const getInvalidValue = function(value, prevPath) {
  const invalidValue = prevPath.reverse().reduce(setInvalidValuePart, value)
  const invalidValueA = serializeValue(invalidValue)
  return invalidValueA
}

const setInvalidValuePart = function(value, part) {
  if (Number.isInteger(part)) {
    return value === undefined ? [] : [value]
  }

  return value === undefined ? {} : { [part]: value }
}

const serializeValue = function(value) {
  return dump(value, { noRefs: true }).trim()
}

module.exports = { getExample }
