import { extname } from 'path'

import { register, type Service } from 'ts-node'

import { addErrorInfo } from '../../error/info.js'

// Allow local plugins to be written with TypeScript.
// Local plugins cannot be transpiled by the build command since they can be run
// before it. Therefore, we type-check and transpile them automatically using
// `ts-node`.
export const registerTypeScript = function (pluginPath: string): Service | undefined {
  if (!isTypeScriptPlugin(pluginPath)) {
    return
  }

  return register()
}

// On TypeScript errors, adds information about the `ts-node` configuration,
// which includes the resolved `tsconfig.json`.
export const addTsErrorInfo = function (error: unknown, tsNodeService: Service | undefined): void {
  if (tsNodeService === undefined) {
    return
  }

  const { config, options: realTsNodeOptions } = tsNodeService
  // `raw` is typed `any`: it is the parsed `tsconfig.json`, which `ts-node` always sets to an object
  const { compilerOptions } = config.raw as { compilerOptions?: unknown }

  // filter out functions as they cannot be serialized
  const tsNodeOptionsEntries: [string, unknown][] = Object.entries(realTsNodeOptions)
  const tsNodeOptions = Object.fromEntries(tsNodeOptionsEntries.filter(([, val]) => typeof val !== 'function'))

  addErrorInfo(error, { tsConfig: { compilerOptions, tsNodeOptions } })
}

const isTypeScriptPlugin = function (pluginPath: string): boolean {
  return TYPESCRIPT_EXTENSIONS.has(extname(pluginPath))
}

const TYPESCRIPT_EXTENSIONS = new Set(['.ts', '.tsx', '.mts', '.cts'])
