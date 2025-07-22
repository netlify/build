import { excludeKeys } from 'filter-obj'

// lodash.omit is 1400 lines of codes. filter-obj is much smaller and simpler.
export const omit = <T extends object>(obj: T, keys: (keyof T)[]): Partial<T> =>
  excludeKeys(obj, (key) => keys.includes(key))
