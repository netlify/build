'use strict'

const { dirname, extname, relative } = require('path')

const createTelemetryObject = ({ functions, internalFunctionsSrc }) =>
  functions.map((functionData) => createTelemetryObjectForFunction({ functionData, internalFunctionsSrc }))

const createTelemetryObjectForFunction = ({ functionData, internalFunctionsSrc }) => {
  const {
    bundler = 'default',
    config = {},
    mainFile = '',
    nativeNodeModules = {},
    nodeModulesWithDynamicImports = [],
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
  }
}

const isInternalFunction = ({ internalFunctionsSrc, mainFile }) =>
  internalFunctionsSrc !== undefined && !relative(dirname(mainFile), internalFunctionsSrc).startsWith('..')

module.exports = { createTelemetryObject }
