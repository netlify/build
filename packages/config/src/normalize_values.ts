export const isSet = (value: unknown): boolean =>
  value !== undefined && value !== null && (typeof value !== 'string' || value.trim() !== '')

export const isDefined = (value: unknown): boolean => value !== undefined && value !== null

export const removeUnset = (object: Record<string, unknown>): Record<string, unknown> =>
  Object.fromEntries(Object.entries(object).filter(([, value]) => isSet(value)))

/** `{ ...value }` for an unchecked value: a string gives its characters by index, an array its items. */
export const spreadValue = (value: unknown): Record<string, unknown> =>
  value === undefined || value === null ? {} : Object.fromEntries(Object.entries(value))
