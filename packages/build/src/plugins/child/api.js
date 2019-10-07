const NetlifyAPI = require('netlify')

// Retrieve Netlify API client, providing a authentication token was provided
const getApiClient = function({ logics: [{ scopes = DEFAULT_SCOPES }], token, pluginId }) {
  if (!token) {
    if (scopes.length !== 0) {
      throw new Error(`The "${pluginId}" plugin requires a Netlify API authentication token`)
    }

    return
  }

  const api = new NetlifyAPI(token)

  disableApiMethods(api, pluginId, scopes)

  return api
}

const DEFAULT_SCOPES = []

// Redact API methods to scopes
const disableApiMethods = function(api, pluginId, scopes) {
  if (scopes.includes('*')) {
    return
  }

  Object.keys(NetlifyAPI.prototype)
    .filter(method => !scopes.includes(method))
    .forEach(method => {
      api[method] = disabledApiMethod.bind(null, pluginId, method)
    })
}

const disabledApiMethod = async function(pluginId, method) {
  throw new Error(`The "${pluginId}" plugin is not authorized to use "api.${method}". Please update the plugin scopes.`)
}

module.exports = { getApiClient }
