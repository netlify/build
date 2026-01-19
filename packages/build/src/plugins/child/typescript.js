import { extname } from 'path'

import { register as registerCJS } from 'tsx/cjs/api'
import { register as registerESM } from 'tsx/esm/api'

// Allow local plugins to be written with TypeScript.
// Local plugins cannot be transpiled by the build command since they can be run
// before it. Therefore, we type-check and transpile them automatically using
// `tsx``.
export const registerTypeScript = function (pluginPath) {
  if (!isTypeScriptPlugin(pluginPath)) {
    return
  }

  registerESM()
  registerCJS()
}

const isTypeScriptPlugin = function (pluginPath) {
  return TYPESCRIPT_EXTENSIONS.has(extname(pluginPath))
}

const TYPESCRIPT_EXTENSIONS = new Set(['.ts', '.tsx', '.mts', '.cts'])
