const defaultFlags: Record<string, boolean> = {
  edge_functions_cache_deno_dir: false,
  edge_functions_config_export: false,
  edge_functions_fail_unsupported_regex: false,
}

type FeatureFlag = keyof typeof defaultFlags
type FeatureFlags = Record<FeatureFlag, boolean>

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
