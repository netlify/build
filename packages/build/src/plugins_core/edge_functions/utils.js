import { resolve } from 'path'

import { pathExists } from 'path-exists'

// We run this core step if at least one of the functions directories (the
// one configured by the user or the internal one) exists. We use a dynamic
// `condition` because the directories might be created by the build command
// or plugins.
export const hasEdgeFunctionsDirectories = async function ({
  buildDir,
  constants: { INTERNAL_EDGE_FUNCTIONS_SRC, EDGE_FUNCTIONS_SRC },
}) {
  const hasFunctionsSrc = EDGE_FUNCTIONS_SRC !== undefined && EDGE_FUNCTIONS_SRC !== ''

  if (hasFunctionsSrc) {
    return true
  }

  const internalFunctionsSrc = resolve(buildDir, INTERNAL_EDGE_FUNCTIONS_SRC)

  return await pathExists(internalFunctionsSrc)
}
