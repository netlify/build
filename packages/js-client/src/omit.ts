export default function omit<T extends Record<string | number | symbol, unknown>, K extends keyof T>(
  obj: T,
  keys: K[],
): Omit<T, K> {
  const shallowCopy = { ...obj }
  for (const key of keys) {
    delete shallowCopy[key]
  }
  return shallowCopy
}
