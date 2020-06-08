const memoizeOne = require('memoize-one')

// Add a `object[propName]` whose value is the return value of `getFunc()`, but
// is only retrieved when accessed.
const addLazyProp = function(object, propName, getFunc) {
  const mGetFunc = memoizeOne(getFunc, returnTrue)
  Object.defineProperty(object, propName, {
    get: mGetFunc,
    enumerable: true,
    configurable: true,
  })
}

const returnTrue = function() {
  return true
}

module.exports = { addLazyProp }
