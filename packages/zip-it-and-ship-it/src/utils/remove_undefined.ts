import { includeKeys } from 'filter-obj'

const isUndefined = (_key: unknown, value: unknown) => value !== undefined

export const removeUndefined = function <T extends Record<string, unknown>>(obj: T): T {
  return includeKeys(obj, isUndefined) as T
}
