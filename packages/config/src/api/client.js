const NetlifyAPI = require('netlify')

const { removeFalsy } = require('../utils/remove_falsy')

// Retrieve Netlify API client, if an access token was passed
const getApiClient = function({ token, testOpts: { scheme, host } = {} }) {
  if (!token) {
    return
  }

  // TODO: find less intrusive way to mock HTTP requests
  const parameters = removeFalsy({ scheme, host })
  const api = new NetlifyAPI(token, parameters)
  return api
}

module.exports = { getApiClient }
