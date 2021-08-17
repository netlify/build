'use strict'

const { resolve } = require('path')

const { parseAllRedirects } = require('netlify-redirect-parser')

const { warnRedirectsParsing, warnRedirectsException } = require('./log/messages')

// Retrieve path to `_redirects` file (even if it does not exist yet)
const getRedirectsPath = function ({ build: { publish } }) {
  return resolve(publish, REDIRECTS_FILENAME)
}

const REDIRECTS_FILENAME = '_redirects'

// Add `config.redirects`
const addRedirects = async function ({ redirects: configRedirects, ...config }, redirectsPath, logs) {
  try {
    const { redirects, errors } = await parseAllRedirects({
      redirectsFiles: [redirectsPath],
      configRedirects,
      minimal: true,
    })
    warnRedirectsParsing(logs, errors)
    return { ...config, redirects }
    // @todo remove this failsafe once the code is stable
  } catch (error) {
    warnRedirectsException(logs, error.message)
    return { ...config, redirects: [] }
  }
}

module.exports = { getRedirectsPath, addRedirects }
