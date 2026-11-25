// Merges configuration objects left to right. Later values win, `undefined`
// values are ignored, and arrays are concatenated rather than replaced.
export const mergeConfig = <T extends Record<string, unknown>>(...configs: Partial<T>[]): T => {
  const merged: Record<string, unknown> = {}

  for (const config of configs) {
    for (const [key, value] of Object.entries(config)) {
      if (value === undefined) {
        continue
      }

      const current = merged[key]

      merged[key] =
        Array.isArray(current) && Array.isArray(value) ? [...(current as unknown[]), ...(value as unknown[])] : value
    }
  }

  return merged as T
}
