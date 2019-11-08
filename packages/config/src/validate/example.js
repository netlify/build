const { dump, JSON_SCHEMA } = require('js-yaml')
const indentString = require('indent-string')

// Print invalid valud and example netlify.yml
const getExample = function(value, example) {
  return `
Invalid value:

${indentString(serializeValue(value), 2)}

Example 'netlify.yml':
${indentString(example, 2)}`
}

const serializeValue = function(value) {
  if (value === undefined) {
    return String(value)
  }

  return dump(value, { schema: JSON_SCHEMA, noRefs: true }).trim()
}

module.exports = { getExample }
