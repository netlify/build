const { THEME } = require('../../log/theme')

const { parseError } = require('./parse')

// Serialize an error object into a title|body string to print in logs
const serializeLogError = function(error, { debug }) {
  const { title, message, pluginInfo, locationInfo, errorProps, isSuccess } = parseError({
    error,
    colors: true,
    debug,
  })
  const body = getBody({ message, pluginInfo, locationInfo, errorProps, isSuccess })
  return { title, body, isSuccess }
}

const getBody = function({ message, pluginInfo, locationInfo, errorProps, isSuccess }) {
  if (isSuccess) {
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

const blockHasValue = function([, value]) {
  return value !== undefined
}

const serializeBlock = function([key, value]) {
  return `${THEME.errorSubHeader(LOG_BLOCK_NAMES[key])}\n${value}`
}

const LOG_BLOCK_NAMES = {
  message: 'Error message',
  pluginInfo: 'Plugin details',
  locationInfo: 'Error location',
  errorProps: 'Error properties',
}

module.exports = { serializeLogError }
