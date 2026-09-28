// lodash.omit is 1400 lines of codes. This is much smaller and simpler.
export const omit = <T extends object>(obj: T, keys: (keyof T)[]): Partial<T> =>
  Object.fromEntries(Object.entries(obj).filter(([key]) => !keys.includes(key as keyof T))) as Partial<T>
