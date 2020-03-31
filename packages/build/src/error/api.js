const mapObj = require('map-obj')

const { addErrorInfo } = require('./info')

// Wrap `api.*` methods so that they add more error information
const addApiErrorHandlers = function(api) {
  if (api === undefined) {
    return
  }

  return mapObj(api, addErrorHandler)
}

const addErrorHandler = function(key, value) {
  if (typeof value !== 'function') {
    return [key, value]
  }

  const valueA = apiMethodHandler.bind(null, key, value)
  return [key, valueA]
}

const apiMethodHandler = async function(endpoint, method, parameters, ...args) {
  try {
    return await method(parameters, ...args)
  } catch (error) {
    addErrorInfo(error, { type: 'api', location: { endpoint, parameters } })
    throw error
  }
}

module.exports = { addApiErrorHandlers }
