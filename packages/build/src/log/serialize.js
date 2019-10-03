const { inspect } = require('util')

const { hasColors } = require('./colors')

// Serialize object for printing
const serialize = function(obj) {
  return inspect(obj, { depth: null, colors: hasColors() })
}

module.exports = { serialize }
