const defaultFlags: Record<string, boolean> = {
  edge_functions_produce_eszip: false,
}

type FeatureFlag = keyof typeof defaultFlags
type FeatureFlags = Record<FeatureFlag, boolean>

const getFlags = (input: Record<string, boolean> = {}, flags = defaultFlags): Record<FeatureFlag, string> =>
  Object.entries(flags).reduce(
    (result, [key, defaultValue]) => ({
      ...result,
      [key]: input[key] === undefined ? defaultValue : input[key],
    }),
    {},
  )

export { defaultFlags, getFlags }
export type { FeatureFlag, FeatureFlags }
