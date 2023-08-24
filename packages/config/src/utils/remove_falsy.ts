import { includeKeys } from 'filter-obj'

/**
 * Remove falsy values from object
 */
export const removeFalsy = function (obj) {
  return includeKeys(obj, (_key, value) => isTruthy(value))
}

type NoUndefinedField<T> = { [P in keyof T]: Exclude<T[P], null | undefined> }

export const removeUndefined = <T extends object>(obj: T) =>
  includeKeys(obj, (_key, value) => isDefined(value)) as NoUndefinedField<T>

export const isTruthy = <T>(value: T | false | undefined | null | '' | ' '): value is T =>
  isDefined(value) && (typeof value !== 'string' || value.trim() !== '')

export const isDefined = <T>(value: T | undefined | null): value is T => value !== undefined && value !== null
