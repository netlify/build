const filterObj = require('filter-obj')

// lodash.omit is 1400 lines of codes. filter-obj is much smaller and simpler.
const omit = function(obj, keys) {
  return filterObj(obj, key => !keys.includes(key))
}

module.exports = { omit }
