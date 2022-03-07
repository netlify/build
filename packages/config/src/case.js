// Some properties can be optionally capitalized. We normalize them to lowercase
export const normalizeConfigCase = function ({ Build, build = Build, ...config }) {
  const buildA = normalizeBuildCase(build)
  return { ...config, build: buildA }
}

const normalizeBuildCase = function ({
  Base,
  base = Base,
  Command,
  command = Command,
  Edge_handlers: EdgeHandlers,
  edge_handlers: edgeHandlers = EdgeHandlers,
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
} = {}) {
  return {
    ...build,
    base,
    command,
    edge_handlers: edgeHandlers,
    environment,
    functions,
    ignore,
    processing,
    publish,
  }
}
