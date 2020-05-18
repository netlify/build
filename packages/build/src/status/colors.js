const stripAnsi = require('strip-ansi')

// Remove colors from statuses
const removeStatusesColors = function(statuses) {
  return statuses.map(removeStatusColors)
}

const removeStatusColors = function(status) {
  const attributes = COLOR_ATTRIBUTES.map(attribute => removeAttrColor(status, attribute))
  return Object.assign({}, status, ...attributes)
}

const COLOR_ATTRIBUTES = ['title', 'summary', 'text']

const removeAttrColor = function(status, attribute) {
  const value = status[attribute]
  if (value === undefined) {
    return {}
  }

  const valueA = stripAnsi(value)
  return { [attribute]: valueA }
}

module.exports = { removeStatusesColors }
