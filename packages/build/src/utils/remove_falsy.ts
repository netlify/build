import { includeKeys } from 'filter-obj'

// Remove falsy values from object
export const removeFalsy = function <T extends Record<PropertyKey, unknown>>(obj: T): Partial<T> {
  return includeKeys(obj, isDefined)
}

const isDefined = function (_key: PropertyKey, value: unknown): boolean {
  return value !== undefined && value !== ''
}
