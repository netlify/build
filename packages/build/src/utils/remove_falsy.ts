// Remove falsy values from object
export const removeFalsy = function <T extends Record<PropertyKey, unknown>>(obj: T): Partial<T> {
  return Object.fromEntries(Object.entries(obj).filter(([, value]) => isDefined(value))) as Partial<T>
}

const isDefined = function (value: unknown): boolean {
  return value !== undefined && value !== ''
}
