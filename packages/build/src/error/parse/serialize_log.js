'use strict'

const { THEME } = require('../../log/theme')

// Serialize an error object into a title|body string to print in logs
const serializeLogError = function ({
  fullErrorInfo: { title, severity, message, pluginInfo, locationInfo, errorProps },
}) {
  const body = getBody({ message, pluginInfo, locationInfo, errorProps, severity })
  return { title, body }
}

const getBody = function ({ message, pluginInfo, locationInfo, errorProps, severity }) {
  if (severity === 'none') {
    return message
  }

  return Object.entries({
    message,
    pluginInfo,
    locationInfo,
    errorProps,
  })
    .filter(blockHasValue)
    .map(serializeBlock)
    .join('\n\n')
}

const blockHasValue = function ([, value]) {
  return value !== undefined
}

const serializeBlock = function ([key, value]) {
  return `${THEME.errorSubHeader(LOG_BLOCK_NAMES[key])}\n${value}`
}

const LOG_BLOCK_NAMES = {
  message: 'Error message',
  pluginInfo: 'Plugin details',
  locationInfo: 'Error location',
  errorProps: 'Error properties',
}

module.exports = { serializeLogError }
