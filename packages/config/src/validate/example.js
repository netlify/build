const { dump } = require('js-yaml')
const indentString = require('indent-string')
const { red, green } = require('chalk')

// Print invalid value and example netlify.yml
const getExample = function({ value, parent, key, prevPath, example }) {
  const exampleA = typeof example === 'function' ? example(value, key, parent, prevPath) : example
  return `
${red.bold('Invalid syntax')}

${indentString(getInvalidValue(value, prevPath), 2)}

${green.bold('Valid syntax')}

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

  // istanbul ignore next
  return value === undefined ? {} : { [part]: value }
}

const serializeValue = function(value) {
  return dump(value, { noRefs: true }).trim()
}

module.exports = { getExample }
