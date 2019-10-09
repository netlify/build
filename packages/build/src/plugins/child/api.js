const NetlifyAPI = require('netlify')

// Retrieve Netlify API client, providing a authentication token was provided
const getApiClient = function({ logic: { scopes = DEFAULT_SCOPES }, token }) {
  if (!token) {
    if (scopes.length !== 0) {
      throw new Error(`This plugin requires a Netlify API authentication token`)
    }

    return
  }

  const api = new NetlifyAPI(token)

  disableApiMethods(api, scopes)

  return api
}

const DEFAULT_SCOPES = []

// Redact API methods to scopes
const disableApiMethods = function(api, scopes) {
  if (scopes.includes('*')) {
    return
  }

  Object.keys(NetlifyAPI.prototype)
    .filter(method => !scopes.includes(method))
    .forEach(method => {
      api[method] = disabledApiMethod.bind(null, method)
    })
}

const disabledApiMethod = async function(method) {
  throw new Error(`This plugin is not authorized to use "api.${method}". Please update the plugin scopes.`)
}

module.exports = { getApiClient }
