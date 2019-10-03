const NetlifyAPI = require('netlify')

// Retrieve Netlify API client, providing a authentication token was provided
const getApiClient = function({ token, name, scopes }) {
  if (!token) {
    return
  }

  const api = new NetlifyAPI(token)

  /* Redact API methods to scopes. Default scopes '*'... revisit */
  if (scopes && !scopes.includes('*')) {
    Object.keys(NetlifyAPI.prototype)
      .filter(method => !scopes.includes(method))
      .forEach(method => {
        api[method] = disabledApiMethod.bind(null, name, method)
      })
  }

  return api
}

const disabledApiMethod = async function(pluginName, method) {
  throw new Error(
    `The "${pluginName}" plugin is not authorized to use "api.${method}". Please update the plugin scopes.`
  )
}

module.exports = { getApiClient }
