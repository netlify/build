const util = require('util')

module.exports = function deepLog(obj) {
  console.log(util.inspect(obj, { showHidden: false, depth: null, colors: true }))
}
