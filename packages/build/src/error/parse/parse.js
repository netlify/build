const { getErrorInfo } = require('../info')
const { getTypeInfo } = require('../type')

const { getLocationInfo } = require('./location')
const { getPluginInfo } = require('./plugin')
const { getErrorProps } = require('./properties')
const { getStackInfo } = require('./stack')

// Parse all error information into a normalized sets of properties
const parseError = function({ error, colors }) {
  const {
    message,
    stack,
    netlifyConfig,
    childEnv,
    errorProps,
    errorInfo,
    errorInfo: { location = {}, plugin = {} },
    state,
    title,
    isSuccess,
    stackType,
    locationType,
    showErrorProps,
    rawStack,
  } = parseErrorInfo(error)

  const titleA = getTitle(title, errorInfo)

  const { message: messageA, stack: stackA } = getStackInfo({ message, stack, stackType, rawStack, isSuccess })

  const pluginInfo = getPluginInfo(plugin, location)
  const locationInfo = getLocationInfo({ stack: stackA, location, locationType })
  const errorPropsA = getErrorProps({ errorProps, showErrorProps, colors })
  return {
    state,
    title: titleA,
    message: messageA,
    pluginInfo,
    locationInfo,
    netlifyConfig,
    childEnv,
    errorProps: errorPropsA,
    isSuccess,
  }
}

// Parse error instance into all the basic properties containing information
const parseErrorInfo = function(error) {
  const { message, stack, netlifyConfig, childEnv, ...errorProps } = normalizeError(error)
  const errorInfo = getErrorInfo(errorProps)
  const { state, title, isSuccess, stackType, locationType, showErrorProps, rawStack } = getTypeInfo(errorInfo)
  return {
    message,
    stack,
    netlifyConfig,
    childEnv,
    errorProps,
    errorInfo,
    state,
    title,
    isSuccess,
    stackType,
    locationType,
    showErrorProps,
    rawStack,
  }
}

const normalizeError = function(error) {
  if (error instanceof Error && typeof error.message === 'string' && typeof error.stack === 'string') {
    return error
  }

  return new Error(String(error))
}

// Retrieve title to print in logs
const getTitle = function(title, errorInfo) {
  if (typeof title !== 'function') {
    return title
  }

  return title(errorInfo)
}

module.exports = { parseError }
