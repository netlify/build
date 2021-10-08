'use strict'

const { extname } = require('path')

const { INTERNAL_FUNCTIONS_SRC: internalFunctionsSrc } = require('../core/constants')

const createBundlingTelemetryObject = ({ functions = [] }) =>
  functions.reduce(createBundlingTelemetryObjectForFunction, {
    built_source: 0,
    external_modules: [],
    internal_functions: 0,
    native_modules: [],
    total: functions.length,
  })

const createBundlingTelemetryObjectForFunction = (aggregatedData, functionData) => {
  const { bundler = 'default', config = {}, mainFile = '', nativeNodeModules = {}, runtime = 'default' } = functionData
  const bundlerKey = `bundler_${bundler}`
  const runtimeKey = `runtime_${runtime}`
  const { externalNodeModules = [] } = config
  const isBuiltFromSource = !['', '.zip'].includes(extname(mainFile))
  const isInternal = mainFile.includes(internalFunctionsSrc)
  const externalModules = new Set([...aggregatedData.external_modules, ...externalNodeModules])
  const nativeModules = new Set([...aggregatedData.native_modules, ...Object.keys(nativeNodeModules)])

  return {
    ...aggregatedData,
    [bundlerKey]: (aggregatedData[bundlerKey] || 0) + 1,
    [runtimeKey]: (aggregatedData[runtimeKey] || 0) + 1,
    built_source: aggregatedData.built_source + (isBuiltFromSource ? 1 : 0),
    external_modules: [...externalModules],
    internal_functions: aggregatedData.internal_functions + (isInternal ? 1 : 0),
    native_modules: [...nativeModules],
  }
}

module.exports = { createBundlingTelemetryObject }
