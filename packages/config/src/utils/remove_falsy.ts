/**
 * Remove falsy values from object
 */
export const removeFalsy = <T extends object>(obj: T) =>
  Object.fromEntries(Object.entries(obj).filter(([, value]) => isTruthy(value))) as NoFalsyField<T>

type NoFalsyField<T> = { [P in keyof T]: Exclude<T[P], null | undefined | ''> }

type NoUndefinedField<T> = { [P in keyof T]: Exclude<T[P], null | undefined> }

export const removeUndefined = <T extends object>(obj: T) =>
  Object.fromEntries(Object.entries(obj).filter(([, value]) => isDefined(value))) as NoUndefinedField<T>

export const isTruthy = <T>(value: T | false | undefined | null | '' | ' '): value is T =>
  isDefined(value) && (typeof value !== 'string' || value.trim() !== '')

export const isDefined = <T>(value: T | undefined | null): value is T => value !== undefined && value !== null
