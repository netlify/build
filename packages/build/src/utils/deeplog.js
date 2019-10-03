const { inspect } = require('util')

const { hasColors } = require('../build/colors')

const deepLog = function(obj) {
  console.log(inspect(obj, { depth: null, colors: hasColors() }))
}

module.exports = { deepLog }
