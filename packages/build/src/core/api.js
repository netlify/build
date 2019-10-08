const NetlifyAPI = require('netlify')

// Retrieve Netlify API client, providing a authentication token was provided
const getApiClient = function({ token, name, scopes }) {
  if (!token) {
    if (scopes.length !== 0) {
      throw new Error(`The "${name}" plugin requires a Netlify API authentication token`)
    }

    return
  }

  const api = new NetlifyAPI(token)

  disableApiMethods(api, name, scopes)

  return api
}

// Redact API methods to scopes
const disableApiMethods = function(api, name, scopes) {
  if (scopes.includes('*')) {
    return
  }

  Object.keys(NetlifyAPI.prototype)
    .filter(method => !scopes.includes(method))
    .forEach(method => {
      api[method] = disabledApiMethod.bind(null, name, method)
    })
}

const disabledApiMethod = async function(name, method) {
  throw new Error(`The "${name}" plugin is not authorized to use "api.${method}". Please update the plugin scopes.`)
}

module.exports = { getApiClient }
