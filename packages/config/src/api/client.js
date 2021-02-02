'use strict'

const NetlifyAPI = require('netlify')

const { removeFalsy } = require('../utils/remove_falsy')

// Retrieve Netlify API client, if an access token was passed
const getApiClient = function ({ token, offline, testOpts = {}, host, scheme, pathPrefix }) {
  if (!token || offline) {
    return
  }

  // TODO: find less intrusive way to mock HTTP requests
  const parameters = removeFalsy({ scheme: testOpts.scheme || scheme, host: testOpts.host || host, pathPrefix })
  const api = new NetlifyAPI(token, parameters)
  return api
}

module.exports = { getApiClient }
