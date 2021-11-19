'use strict'

const { extname, resolve } = require('path')

const { register } = require('ts-node')

const { addErrorInfo } = require('../../error/info')

const PACKAGE_JSON_DIR = `${__dirname}/../../..`
// We require this dynamically to ensure `PACKAGE_JSON_DIR` is correct
// even if this file moves.
// We use `package.json` to ensure changing the types location does not break
// this file.
// eslint-disable-next-line import/no-dynamic-require
const { name, types } = require(`${PACKAGE_JSON_DIR}/package.json`)

// Allow local plugins to be written with TypeScript.
// Local plugins cannot be transpiled by the build command since they can be run
// before it. Therefore, we type-check and transpile them automatically using
// `ts-node`.
const registerTypeScript = function (pluginPath) {
  if (!isTypeScriptPlugin(pluginPath)) {
    return
  }

  const paths = getTypesPaths()
  return register({ compilerOptions: { paths } })
}

// Retrieve the file path to `@netlify/build` TypeScript types.
// This prevents any resolution error if the `@netlify/build` module cannot
// be found.
const getTypesPaths = function () {
  const typesPath = resolve(PACKAGE_JSON_DIR, types)
  return { [name]: [typesPath] }
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
