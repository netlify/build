import { serializeObject } from '../../log/serialize.js'
import { getErrorInfo } from '../info.js'
import type { BuildError, BasicErrorInfo, ErrorInfo, TitleFunction } from '../types.js'
import { getTypeInfo } from '../types.js'

import { getLocationInfo } from './location.js'
import { normalizeError } from './normalize.js'
import { getPluginInfo } from './plugin.js'
import { getErrorProps } from './properties.js'
import { getStackInfo } from './stack.js'

// Add additional type-specific error information
export const getFullErrorInfo = function ({ error, colors, debug }): BuildError {
  const basicErrorInfo = parseErrorInfo(error)
  const {
    message,
    stack,
    errorProps,
    errorInfo,
    severity,
    title,
    stackType,
    locationType,
    showErrorProps,
    rawStack,
    errorMetadata,
  } = basicErrorInfo

  const { location = {}, plugin = {}, tsConfig } = errorInfo

  const titleA = getTitle(title, errorInfo)

  const { message: messageA, stack: stackA } = getStackInfo({ message, stack, stackType, rawStack, severity, debug })

  // FIXME here location should be PluginLocation type, but I'm affraid to mess up the current
  // getPluginInfo behaviour by running a type check
  const pluginInfo = getPluginInfo(plugin, location as any)
  const tsConfigInfo = getTsConfigInfo(tsConfig)
  const locationInfo = getLocationInfo({ stack: stackA, location, locationType })
  const errorPropsA = getErrorProps({ errorProps, showErrorProps, colors })

  return {
    ...basicErrorInfo,
    title: titleA,
    message: messageA,
    tsConfigInfo,
    pluginInfo,
    locationInfo,
    errorProps: errorPropsA,
    errorMetadata,
  }
}

// Serialize the `tsConfig` error information
const getTsConfigInfo = function (tsConfig: any) {
  if (tsConfig === undefined) {
    return
  }

  return serializeObject(tsConfig)
}

// Parse error instance into all the basic properties containing information
export const parseErrorInfo = function (error: Error): BasicErrorInfo {
  const { message, stack, ...errorProps } = normalizeError(error)
  const [errorInfo, errorPropsA] = getErrorInfo(errorProps)
  const { errorMetadata } = errorInfo
  const {
    type,
    severity,
    title,
    group,
    stackType,
    locationType,
    showErrorProps,
    showInBuildLog = true,
    rawStack,
  } = getTypeInfo(errorInfo)
  const basicErrorInfo = {
    message,
    stack,
    errorProps: errorPropsA,
    errorInfo,
    type,
    severity,
    title,
    group,
    stackType,
    locationType,
    showInBuildLog,
    showErrorProps,
    rawStack,
    errorMetadata,
  }
  return basicErrorInfo
}

// Retrieve title to print in logs
const getTitle = function (title: TitleFunction | string, errorInfo: ErrorInfo) {
  console.log('title function: ', title.toString())
  console.log('errorInfo: ', errorInfo)
  if (typeof title !== 'function') {
    return title
  }

  return title(errorInfo)
}
