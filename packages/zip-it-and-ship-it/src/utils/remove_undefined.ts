const isDefined = (value: unknown) => value !== undefined

export const removeUndefined = function <T extends { [key: string]: unknown }>(obj: T): T {
  return Object.fromEntries(Object.entries(obj).filter(([, value]) => isDefined(value))) as T
}
