const NetlifyAPI = require('netlify')

// Retrieve Netlify API client, if an access token was passed
const getApiClient = function(token) {
  if (token === undefined) {
    return
  }

  // TODO: find less intrusive way to mock HTTP requests
  const api = new NetlifyAPI(token)
  return api
}

module.exports = { getApiClient }
