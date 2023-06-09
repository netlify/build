import { includeKeys } from 'filter-obj'

// Remove falsy values from object
export const removeFalsy = function (obj: Record<string | symbol, unknown>) {
  return includeKeys(obj, isDefined)
}

const isDefined = function (_key: string | symbol, value: unknown): boolean {
  return value !== undefined && value !== ''
}
