const { inspect } = require('util')

const { redBright } = require('chalk')
const indentString = require('indent-string')

const { EMPTY_LINE, HEADING_PREFIX, INDENT_SIZE } = require('../log/constants')

const { getErrorInfo } = require('./info')
const { getTypeInfo } = require('./type')
const { getStackInfo } = require('./stack')
const { getPluginBlock } = require('./plugin')
const { getLocationBlock } = require('./location')

// Serialize an error object into a header|body string to print in logs
const serializeError = function({ message, stack, ...errorProps }) {
  const { type, ...errorInfo } = getErrorInfo(errorProps)
  const { header, ...typeInfo } = getTypeInfo(type)
  const body = getBody({ typeInfo, message, stack, errorProps, ...errorInfo })
  return { header, body }
}

// Retrieve body to print in logs
const getBody = function({
  typeInfo: { stackType, getLocation, showErrorProps },
  message,
  stack,
  errorProps,
  location = {},
  plugin = {},
}) {
  const { message: messageA, stack: stackA } = getStackInfo({ message, stack, stackType })
  const messageBlock = { name: 'Error message', value: messageA }
  const pluginBlock = getPluginBlock(plugin)
  const locationBlock = getLocationBlock({ stack: stackA, location, getLocation })
  const errorPropsBlock = getErrorPropsBlock(errorProps, showErrorProps)
  return [messageBlock, pluginBlock, locationBlock, errorPropsBlock]
    .filter(Boolean)
    .map(serializeBlock)
    .join(`${EMPTY_LINE}\n${EMPTY_LINE}\n`)
}

// In uncaught exceptions, print error static properties
const getErrorPropsBlock = function(errorProps, showErrorProps) {
  if (!showErrorProps || Object.keys(errorProps).length === 0) {
    return
  }

  const value = inspect(errorProps)
  return { name: 'Error properties', value }
}

const serializeBlock = function({ name, value }) {
  return `${redBright.bold(`${HEADING_PREFIX} ${name}`)}
${indentString(value, INDENT_SIZE)}`
}

module.exports = { serializeError }
