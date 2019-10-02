const API = require('netlify')

// Retrieve Netlify API client, providing a authentication token was provided
const getApiClient = function({ netlifyToken, name, scopes }) {
  if (!netlifyToken) {
    return
  }

  const apiClient = new API(netlifyToken)

  /* Redact API methods to scopes. Default scopes '*'... revisit */
  if (scopes && !scopes.includes('*')) {
    Object.keys(API.prototype)
      .filter(method => !scopes.includes(method))
      .forEach(method => {
        apiClient[method] = disabledApiMethod.bind(null, name, method)
      })
  }

  return apiClient
}

const disabledApiMethod = async function(pluginName, method) {
  throw new Error(
    `The "${pluginName}" plugin is not authorized to use "api.${method}". Please update the plugin scopes.`
  )
}

module.exports = { getApiClient }
