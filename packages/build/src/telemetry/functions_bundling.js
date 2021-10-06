'use strict'

const { extname } = require('path')

const { INTERNAL_FUNCTIONS_SRC: internalFunctionsSrc } = require('../core/constants')

const compareFunctions = ({ name: nameA }, { name: nameB }) => (nameA < nameB ? -1 : 1)

const createBundlingTelemetryObject = ({ functions = [] }) =>
  // It's safe to use `.sort()` as we're operating on a new array.
  // eslint-disable-next-line fp/no-mutating-methods
  [...functions]
    .sort(compareFunctions)
    .map((functionData) => createBundlingTelemetryObjectForFunction({ functionData, internalFunctionsSrc }))

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
