import memoizeOne from 'memoize-one'

// `memoize-one` types its CommonJS export as an ES default export, but does not set that `default` property
const memoize = 'default' in memoizeOne ? memoizeOne.default : memoizeOne

// Add a `object[propName]` whose value is the return value of `getFunc()`, but
// is only retrieved when accessed.
export function addLazyProp<PropName extends string, Value>(
  object: object,
  propName: PropName,
  getFunc: () => Value,
): asserts object is Record<PropName, Value> {
  const mGetFunc = memoize(getFunc, returnTrue)

  // Mutation is required due to the usage of `Object.defineProperty()`
  Object.defineProperty(object, propName, {
    get: mGetFunc,
    enumerable: true,
    configurable: true,
  })
}

const returnTrue = function () {
  return true
}
