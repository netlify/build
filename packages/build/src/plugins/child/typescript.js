'use strict'

const { extname } = require('path')

const { register } = require('ts-node')

const { addErrorInfo } = require('../../error/info')

// Allow local plugins to be written with TypeScript.
// Local plugins cannot be transpiled by the build command since they can be run
// before it. Therefore, we type-check and transpile them automatically using
// `ts-node`.
const registerTypeScript = function (pluginPath) {
  if (!isTypeScriptPlugin(pluginPath)) {
    return
  }

  return register()
}

// On TypeScript errors, adds information about the `ts-node` configuration,
// which includes the resolved `tsconfig.json`.
const addTsErrorInfo = function (error, tsNodeService) {
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

module.exports = { registerTypeScript, addTsErrorInfo }
