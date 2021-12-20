import { extname } from 'path'

import { register } from 'ts-node'

import { addErrorInfo } from '../../error/info.js'

// Allow local plugins to be written with TypeScript.
// Local plugins cannot be transpiled by the build command since they can be run
// before it. Therefore, we type-check and transpile them automatically using
// `ts-node`.
export const registerTypeScript = function (pluginPath) {
  if (!isTypeScriptPlugin(pluginPath)) {
    return
  }

  return register()
}

// On TypeScript errors, adds information about the `ts-node` configuration,
// which includes the resolved `tsconfig.json`.
export const addTsErrorInfo = function (error, tsNodeService) {
  if (tsNodeService === undefined) {
    return
  }

  const {
    config: {
      raw: { compilerOptions },
    },
    options: tsNodeOptions,
  } = tsNodeService
  addErrorInfo(error, { tsConfig: { compilerOptions, tsNodeOptions } })
}

const isTypeScriptPlugin = function (pluginPath) {
  return TYPESCRIPT_EXTENSIONS.has(extname(pluginPath))
}

const TYPESCRIPT_EXTENSIONS = new Set(['.ts', '.tsx', '.mts', '.cts'])
