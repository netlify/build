/**
 * The same as `{ ...value }`, for a value that isn't validated yet: a string gives its characters
 * by index, an array its items, and other primitives nothing.
 */
export const spreadValue = (value: unknown): Record<string, unknown> =>
  value === undefined || value === null ? {} : Object.fromEntries(Object.entries(value))
