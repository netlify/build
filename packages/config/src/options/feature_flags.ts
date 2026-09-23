/** From the binary's `--featureFlags=a,b,c` to `{ a: true, b: true, c: true }`. */
export const normalizeCliFeatureFlags = function (cliFeatureFlags: string): Record<string, boolean> {
  return Object.fromEntries(
    cliFeatureFlags
      .split(',')
      .filter((name) => name.trim() !== '')
      .map((name) => [name, true]),
  )
}

/** Default values of the feature flags `@netlify/config` uses. Only these are printed in debug mode. */
export const DEFAULT_FEATURE_FLAGS: Record<string, boolean> = {}
