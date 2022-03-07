import { NetlifyAPI } from 'netlify'

import { removeUndefined } from '../utils/remove_falsy.js'

// Retrieve Netlify API client, if an access token was passed
export const getApiClient = function ({ token, offline, testOpts = {}, host, scheme, pathPrefix }) {
  if (!token || offline) {
    return
  }

  // TODO: find less intrusive way to mock HTTP requests
  const parameters = removeUndefined({ scheme: testOpts.scheme || scheme, host: testOpts.host || host, pathPrefix })
  const api = new NetlifyAPI(token, parameters)
  return api
}
