'use strict'

const { resolve } = require('path')

// TODO: use static `import` after migrating this repository to pure ES modules
const netlifyRedirectParser = import('netlify-redirect-parser')

const { warnRedirectsParsing } = require('./log/messages')

// Retrieve path to `_redirects` file (even if it does not exist yet)
const getRedirectsPath = function ({ build: { publish } }) {
  return resolve(publish, REDIRECTS_FILENAME)
}

const REDIRECTS_FILENAME = '_redirects'

// Add `config.redirects`
const addRedirects = async function ({ redirects: configRedirects, ...config }, redirectsPath, logs) {
  const { parseAllRedirects } = await netlifyRedirectParser
  const { redirects, errors } = await parseAllRedirects({
    redirectsFiles: [redirectsPath],
    configRedirects,
    minimal: true,
  })
  warnRedirectsParsing(logs, errors)
  return { ...config, redirects }
}

module.exports = { getRedirectsPath, addRedirects }
