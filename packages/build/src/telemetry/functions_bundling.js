'use strict'

const { extname } = require('path')

const { INTERNAL_FUNCTIONS_SRC: internalFunctionsSrc } = require('../core/constants')

const createBundlingTelemetryObject = ({ functions = [] }) =>
  functions.map((functionData) => createBundlingTelemetryObjectForFunction({ functionData, internalFunctionsSrc }))

const createBundlingTelemetryObjectForFunction = ({ functionData }) => {
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
  const isInternal = mainFile.includes(internalFunctionsSrc)
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

module.exports = { createBundlingTelemetryObject }
