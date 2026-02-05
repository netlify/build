import memoizeOne from 'memoize-one'

// Add a `object[propName]` whose value is the return value of `getFunc()`, but
// is only retrieved when accessed.
export const addLazyProp = function (object: object, propName: string, getFunc: () => unknown): void {
  // @ts-expect-error(ndhoule): dis be angry
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const mGetFunc: typeof getFunc = memoizeOne(getFunc, returnTrue)

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
