import { spreadValue } from './utils/object.js'
import type { CaseCheckedConfig, RawConfig } from './validate/validations.js'

/** A source with its properties in lower case, so `build` is always an object. */
export type CaseNormalizedConfig = RawConfig & { build: Record<string, unknown> }

/**
 * Some properties may be capitalized, e.g. `[Build]` or `Command`. Lower-case them. When both
 * spellings are present, the lower-case one wins.
 */
export const normalizeConfigCase = function ({ Build, build, ...config }: CaseCheckedConfig): CaseNormalizedConfig {
  return { ...config, build: normalizeBuildCase(build ?? spreadValue(Build)) }
}

const normalizeBuildCase = ({
  Base,
  base = Base,
  Command,
  command = Command,
  Edge_functions: EdgeFunctions,
  edge_functions: edgeFunctions = EdgeFunctions,
  Environment,
  environment = Environment,
  Functions,
  functions = Functions,
  Ignore,
  ignore = Ignore,
  Processing,
  processing = Processing,
  Publish,
  publish = Publish,
  ...build
}: Record<string, unknown>): Record<string, unknown> => ({
  ...build,
  base,
  command,
  edge_functions: edgeFunctions,
  environment,
  functions,
  ignore,
  processing,
  publish,
})
