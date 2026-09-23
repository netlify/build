import { serializeObject } from '../../log/serialize.js'
import { getErrorInfo } from '../info.js'
import type { AnyErrorLocation, BuildError, BasicErrorInfo, ErrorInfo, TitleFunction } from '../types.js'
import { DEFAULT_TITLE, getTypeInfo, hasErrorLocation } from '../types.js'

import { getLocationInfo } from './location.js'
import { normalizeError } from './normalize.js'
import { getPluginInfo } from './plugin.js'
import { getErrorProps } from './properties.js'
import { getStackInfo } from './stack.js'

// Add additional type-specific error information
export const getFullErrorInfo = function ({
  error,
  colors,
  debug,
}: {
  error: unknown
  colors: boolean
  debug: boolean | undefined
}): BuildError {
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

  const { packageName, loadedFrom }: AnyErrorLocation = location
  const pluginInfo = getPluginInfo(plugin, { packageName, loadedFrom })
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
const getTsConfigInfo = function (tsConfig: ErrorInfo['tsConfig']) {
  if (tsConfig === undefined) {
    return
  }

  return serializeObject(tsConfig)
}

// Parse error instance into all the basic properties containing information
export const parseErrorInfo = function (error: unknown): BasicErrorInfo {
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
  if (typeof title !== 'function') {
    return title
  }

  // Every title function reads the location, so it would throw
  if (!hasErrorLocation(errorInfo)) {
    return DEFAULT_TITLE
  }

  try {
    return title(errorInfo)
  } catch {
    // A title built from missing error information must not lose the error.
    return DEFAULT_TITLE
  }
}
