'use strict'

const { dirname, extname, relative, resolve } = require('path')

const createBundlingTelemetryObject = ({ buildDir, internalFunctionsSrc: relativeInternalFunctionsSrc, functions }) => {
  if (buildDir === undefined || relativeInternalFunctionsSrc === undefined) {
    return []
  }

  const internalFunctionsSrc = resolve(buildDir, relativeInternalFunctionsSrc)

  return functions.map((functionData) =>
    createBundlingTelemetryObjectForFunction({ functionData, internalFunctionsSrc }),
  )
}

const createBundlingTelemetryObjectForFunction = ({ functionData, internalFunctionsSrc }) => {
  const {
    bundler = 'default',
    config = {},
    mainFile = '',
    nativeNodeModules = {},
    nodeModulesWithDynamicImports = [],
    runtime = 'default',
  } = functionData
  const { externalNodeModules = [] } = config
  const isBuiltFromSource = !['', '.zip'].includes(extname(mainFile))
  const isInternal = isInternalFunction({ internalFunctionsSrc, mainFile })
  const nativeModuleNames = Object.keys(nativeNodeModules)

  return {
    bundler,
    externalNodeModules,
    isBuiltFromSource,
    isInternal,
    nativeModuleNames,
    nodeModulesWithDynamicImports,
    runtime,
  }
}

const isInternalFunction = ({ internalFunctionsSrc, mainFile }) =>
  internalFunctionsSrc !== undefined && !relative(dirname(mainFile), internalFunctionsSrc).startsWith('..')

module.exports = { createBundlingTelemetryObject }
