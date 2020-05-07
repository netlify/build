const { inspect } = require('util')

const { THEME } = require('../log/theme')
const { omit } = require('../utils/omit')

const { getErrorInfo, INFO_SYM } = require('./info')
const { getLocationBlock } = require('./location')
const { getPluginBlock } = require('./plugin')
const { getStackInfo } = require('./stack')
const { getTypeInfo } = require('./type')

// Serialize an error object into a header|body string to print in logs
const serializeError = function(error) {
  const { message, stack, ...errorProps } = normalizeError(error)
  const { header, isSuccess, ...typeInfo } = getTypeInfo(errorProps)
  const errorInfo = getErrorInfo(errorProps)
  const headerA = getHeader(header, errorInfo)
  const body = getBody({ typeInfo, isSuccess, message, stack, errorProps, ...errorInfo })
  return { header: headerA, body, isSuccess }
}

const normalizeError = function(error) {
  if (error instanceof Error) {
    return error
  }

  return new Error(String(error))
}

// Retrieve header to print in logs
const getHeader = function(header, errorInfo) {
  if (typeof header !== 'function') {
    return header
  }

  return header(errorInfo)
}

// Retrieve body to print in logs
const getBody = function({
  typeInfo: { stackType, getLocation, showErrorProps, rawStack },
  isSuccess,
  message,
  stack,
  errorProps,
  location = {},
  plugin = {},
}) {
  const { message: messageA, stack: stackA } = getStackInfo({ message, stack, stackType, rawStack })

  if (isSuccess) {
    return messageA.replace(SUCCESS_ERROR_NAME, '')
  }

  const messageBlock = { name: 'Error message', value: messageA }
  const pluginBlock = getPluginBlock(plugin, location)
  const locationBlock = getLocationBlock({ stack: stackA, location, getLocation })
  const errorPropsBlock = getErrorPropsBlock(errorProps, showErrorProps)
  return [messageBlock, pluginBlock, locationBlock, errorPropsBlock]
    .filter(Boolean)
    .map(serializeBlock)
    .join(`\n\n`)
}

const SUCCESS_ERROR_NAME = 'Error: '

// In uncaught exceptions, print error static properties
const getErrorPropsBlock = function(errorProps, showErrorProps) {
  const errorPropsA = omit(errorProps, CLEANED_ERROR_PROPS)

  if (!showErrorProps || Object.keys(errorPropsA).length === 0) {
    return
  }

  const value = inspect(errorPropsA)
  return { name: 'Error properties', value }
}

// Remove error static properties that should not be logged
const CLEANED_ERROR_PROPS = [INFO_SYM, 'requireStack']

const serializeBlock = function({ name, value }) {
  return `${THEME.errorSubHeader(name)}
${value}`
}

module.exports = { serializeError }
