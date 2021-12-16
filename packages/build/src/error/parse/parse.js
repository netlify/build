import { serializeObject } from '../../log/serialize.js'
import { getErrorInfo } from '../info.js'
import { getTypeInfo } from '../type.js'

import { getLocationInfo } from './location.js'
import { normalizeError } from './normalize.js'
import { getPluginInfo } from './plugin.js'
import { getErrorProps } from './properties.js'
import { getStackInfo } from './stack.js'

// Add additional type-specific error information
export const getFullErrorInfo = function ({ error, colors, debug }) {
  const basicErrorInfo = parseErrorInfo(error)
  const {
    message,
    stack,
    errorProps,
    errorInfo,
    errorInfo: { location = {}, plugin = {}, tsConfig },
    severity,
    title,
    stackType,
    locationType,
    showErrorProps,
    rawStack,
  } = basicErrorInfo

  const titleA = getTitle(title, errorInfo)

  const { message: messageA, stack: stackA } = getStackInfo({ message, stack, stackType, rawStack, severity, debug })

  const pluginInfo = getPluginInfo(plugin, location)
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
  }
}

// Serialize the `tsConfig` error information
const getTsConfigInfo = function (tsConfig) {
  if (tsConfig === undefined) {
    return
  }

  return serializeObject(tsConfig)
}

// Parse error instance into all the basic properties containing information
export const parseErrorInfo = function (error) {
  const { message, stack, ...errorProps } = normalizeError(error)
  const [errorInfo, errorPropsA] = getErrorInfo(errorProps)
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
  }
  return basicErrorInfo
}

// Retrieve title to print in logs
const getTitle = function (title, errorInfo) {
  if (typeof title !== 'function') {
    return title
  }

  return title(errorInfo)
}
