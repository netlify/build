import type { NetlifyPluginConstants } from '../../core/constants.js'
import { installFunctionDependencies } from '../../install/functions.js'
import { pathExists } from '../../utils/path_exists.js'

// Plugin to package Netlify functions with @netlify/zip-it-and-ship-it
export const onPreBuild = async function ({
  constants: { FUNCTIONS_SRC, IS_LOCAL },
}: {
  constants: Pick<NetlifyPluginConstants, 'FUNCTIONS_SRC' | 'IS_LOCAL'>
}): Promise<Record<string, never>> {
  if (FUNCTIONS_SRC === undefined || !(await pathExists(FUNCTIONS_SRC))) {
    return {}
  }

  await installFunctionDependencies(FUNCTIONS_SRC, IS_LOCAL)
  return {}
}
