'use strict'

// TODO: use static `import` after migrating `@netlify/config` to pure ES modules
const jsClient = import('netlify')

const { removeUndefined } = require('../utils/remove_falsy')

// Retrieve Netlify API client, if an access token was passed
const getApiClient = async function ({ token, offline, testOpts = {}, host, scheme, pathPrefix }) {
  if (!token || offline) {
    return
  }

  // TODO: find less intrusive way to mock HTTP requests
  const parameters = removeUndefined({ scheme: testOpts.scheme || scheme, host: testOpts.host || host, pathPrefix })
  const { NetlifyAPI } = await jsClient
  const api = new NetlifyAPI(token, parameters)
  return api
}

module.exports = { getApiClient }
