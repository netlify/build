'use strict'

const NetlifyAPI = require('netlify')

const { removeFalsy } = require('../utils/remove_falsy')

// Retrieve Netlify API client, if an access token was passed
// eslint-disable-next-line complexity
const getApiClient = function ({ token, offline, testOpts = {}, host, scheme, pathPrefix }) {
  console.log({ token, offline, testOpts, host, scheme, pathPrefix })
  if (!token || offline) {
    return
  }

  console.log({ testOpts, host, scheme, pathPrefix }, testOpts.host || host)
  // TODO: find less intrusive way to mock HTTP requests
  const parameters = removeFalsy({ scheme: testOpts.scheme || scheme, host: testOpts.host || host, pathPrefix })
  const api = new NetlifyAPI(token, parameters)
  return api
}

module.exports = { getApiClient }
