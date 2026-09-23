/** False for `undefined`, `null` and empty or blank strings; `false` and `0` count as truthy. */
export const isTruthy = <T>(value: T | undefined | null | '' | ' '): value is T =>
  isDefined(value) && (typeof value !== 'string' || value.trim() !== '')

export const isDefined = <T>(value: T | undefined | null): value is T => value !== undefined && value !== null

/** Remove properties whose value is `undefined`, `null`, or an empty or blank string. */
export const removeFalsy = function <T extends object>(object: T): Partial<T> {
  return Object.fromEntries(Object.entries(object).filter(([, value]) => isTruthy(value))) as Partial<T>
}

type NoUndefinedField<T> = { [P in keyof T]: Exclude<T[P], null | undefined> }

/** Remove properties whose value is `undefined` or `null`. */
export const removeUndefined = <T extends object>(object: T) =>
  Object.fromEntries(Object.entries(object).filter(([, value]) => isDefined(value))) as NoUndefinedField<T>
