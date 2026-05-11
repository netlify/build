// Some properties can be optionally capitalized. We normalize them to lowercase
export const normalizeConfigCase = function ({
  Build,
  build = Build,
  ...config
}: {
  Build: Record<string, unknown>
  build: Record<string, unknown>
  [key: string]: unknown
}): Record<string, unknown> {
  const buildA = normalizeBuildCase(build)
  return { ...config, build: buildA }
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
}: Record<string, unknown> = {}): Record<string, unknown> => {
  return {
    ...build,
    base,
    command,
    edge_functions: edgeFunctions,
    environment,
    functions,
    ignore,
    processing,
    publish,
  }
}
