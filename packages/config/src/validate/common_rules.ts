import isPlainObj from 'is-plain-obj'

export const isString = (value: unknown): value is string => typeof value === 'string'

export const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean'

export const isArrayOfStrings = (value: unknown): value is string[] => Array.isArray(value) && value.every(isString)

export const isArrayOfObjects = (value: unknown): value is Record<PropertyKey, unknown>[] =>
  Array.isArray(value) && value.every(isPlainObj)

export const isOneOf = <Value extends string>(values: readonly Value[], value: unknown): value is Value =>
  values.some((allowed) => allowed === value)

/** Checks an object, which earlier rules require to be plain. */
export const checkObject =
  (check: (object: Record<PropertyKey, unknown>) => boolean) =>
  (value: unknown): boolean =>
    isPlainObj(value) && check(value)

export const hasOnlyProperties = (object: Record<PropertyKey, unknown>, properties: readonly string[]): boolean =>
  Object.keys(object).every((key) => properties.includes(key))

export const unknownPropertiesMessage = (properties: readonly string[]): string =>
  `has unknown properties. Valid properties are:\n${properties.map((property) => `  - ${property}`).join('\n')}`
