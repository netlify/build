const defaultFlags = {
  edge_bundler_generate_tarball: false,
}

type FeatureFlag = keyof typeof defaultFlags
type FeatureFlags = Partial<Record<FeatureFlag, boolean>>

const getFlags = (input: Record<string, boolean> = {}, flags = defaultFlags): FeatureFlags =>
  Object.entries(flags).reduce(
    (result, [key, defaultValue]) => ({
      ...result,
      [key]: input[key] === undefined ? defaultValue : input[key],
    }),
    {},
  )

export { defaultFlags, getFlags }
export type { FeatureFlag, FeatureFlags }
