const {
  env: { TEST_SCHEME, TEST_HOST },
} = require('process')

const NetlifyAPI = require('netlify')
const mapObj = require('map-obj')

const { addErrorInfo } = require('../error/info')
const { removeFalsy } = require('../utils/remove_falsy')

// Retrieve Netlify API client, if an access token was passed
const getApiClient = function(token) {
  if (token === undefined) {
    return
  }

  // TODO: find less intrusive way to mock HTTP requests
  const parameters = removeFalsy({ scheme: TEST_SCHEME, host: TEST_HOST })
  const api = new NetlifyAPI(token, parameters)
  const apiA = addErrorHandlers(api)
  return apiA
}

const addErrorHandlers = function(api) {
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

module.exports = { getApiClient }
