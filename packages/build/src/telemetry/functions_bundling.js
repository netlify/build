'use strict'

const { extname } = require('path')

const { INTERNAL_FUNCTIONS_SRC: internalFunctionsSrc } = require('../core/constants')

const createBundlingTelemetryObject = ({ functions = [] }) =>
  functions.reduce(createBundlingTelemetryObjectForFunction, {
    external_modules: [],
    internal: 0,
    native_modules: [],
    total: functions.length,
  })

// eslint-disable-next-line complexity
const createBundlingTelemetryObjectForFunction = (aggregatedData, functionData) => {
  const { bundler = 'default', config = {}, mainFile = '', nativeNodeModules = {}, runtime = 'default' } = functionData
  const bundlerKey = `bundler_${bundler}`
  const runtimeKey = `runtime_${runtime}`
  const runtimeSourceKey = `runtime_${runtime}_source`
  const { externalNodeModules = [] } = config
  const isBuiltFromSource = !['', '.zip'].includes(extname(mainFile))
  const isInternal = mainFile.includes(internalFunctionsSrc)
  const externalModules = new Set([...aggregatedData.external_modules, ...externalNodeModules])
  const nativeModules = new Set([...aggregatedData.native_modules, ...Object.keys(nativeNodeModules)])

  return {
    ...aggregatedData,
    [bundlerKey]: (aggregatedData[bundlerKey] || 0) + 1,
    [runtimeKey]: (aggregatedData[runtimeKey] || 0) + 1,
    [runtimeSourceKey]: (aggregatedData[runtimeSourceKey] || 0) + (isBuiltFromSource ? 1 : 0),
    external_modules: [...externalModules],
    internal: aggregatedData.internal + (isInternal ? 1 : 0),
    native_modules: [...nativeModules],
  }
}

module.exports = { createBundlingTelemetryObject }
