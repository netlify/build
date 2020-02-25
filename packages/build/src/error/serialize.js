const { inspect } = require('util')

const { redBright } = require('chalk')
const indentString = require('indent-string')
const omit = require('omit.js')

const { EMPTY_LINE, HEADING_PREFIX, INDENT_SIZE } = require('../log/constants')

const { getErrorInfo, INFO_SYM } = require('./info')
const { getTypeInfo } = require('./type')
const { getStackInfo } = require('./stack')
const { getPluginBlock } = require('./plugin')
const { getLocationBlock } = require('./location')

// Serialize an error object into a header|body string to print in logs
const serializeError = function({ message, stack, ...errorProps }) {
  const { type, ...errorInfo } = getErrorInfo(errorProps)
  const errorPropsA = cleanErrorProps(errorProps)
  const { header, color = redBright, ...typeInfo } = getTypeInfo(type)
  const body = getBody({ typeInfo, color, message, stack, errorProps: errorPropsA, ...errorInfo })
  return { header, body, color }
}

// Remove error static properties that should not be logged
const cleanErrorProps = function(errorProps) {
  return omit(errorProps, CLEANED_ERROR_PROPS)
}

const CLEANED_ERROR_PROPS = [INFO_SYM, 'requireStack']

// Retrieve body to print in logs
const getBody = function({
  typeInfo: { stackType, getLocation, showErrorProps, rawStack },
  color,
  message,
  stack,
  errorProps,
  location = {},
  plugin = {},
}) {
  const { message: messageA, stack: stackA } = getStackInfo({ message, stack, stackType, rawStack })
  const messageBlock = { name: 'Error message', value: messageA }
  const pluginBlock = getPluginBlock(plugin)
  const locationBlock = getLocationBlock({ stack: stackA, location, getLocation })
  const errorPropsBlock = getErrorPropsBlock(errorProps, showErrorProps)
  return [messageBlock, pluginBlock, locationBlock, errorPropsBlock]
    .filter(Boolean)
    .map(({ name, value }) => serializeBlock({ name, value, color }))
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

const serializeBlock = function({ name, value, color }) {
  return `${color.bold(`${HEADING_PREFIX} ${name}`)}
${indentString(value, INDENT_SIZE)}`
}

module.exports = { serializeError }
