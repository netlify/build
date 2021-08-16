'use strict'

const { resolve } = require('path')

const { parseAllRedirects } = require('netlify-redirect-parser')

const { warnRedirectsParsing, warnRedirectsException } = require('./log/messages')

// Add `config.redirects`
const addRedirects = async function (config, logs) {
  const redirectsPath = resolve(config.build.publish, REDIRECTS_FILENAME)
  const configWithRedirects = await addConfigRedirects(config, redirectsPath, logs)
  return { config: configWithRedirects, redirectsPath }
}

const REDIRECTS_FILENAME = '_redirects'

const addConfigRedirects = async function ({ redirects: configRedirects, ...config }, redirectsPath, logs) {
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

module.exports = { addRedirects, addConfigRedirects }
