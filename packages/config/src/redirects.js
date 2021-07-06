'use strict'

const { resolve } = require('path')

const { parseFileRedirects, mergeRedirects, normalizeRedirects } = require('netlify-redirect-parser')

const { warnRedirectsParsing } = require('./log/messages')
const { INLINE_ORIGIN } = require('./origin')

// Add `config.redirects`
const addRedirects = async function ({
  config,
  config: {
    build: { publish },
    redirects: configRedirects = [],
    redirectsOrigin,
  },
  logs,
}) {
  const redirectsPath = resolve(publish, REDIRECTS_FILENAME)
  try {
    const fileRedirects = await getFileRedirects(redirectsPath, redirectsOrigin)
    const rawRedirects = mergeRedirects({ fileRedirects, configRedirects })
    const redirects = normalizeRedirects(rawRedirects)
    return { config: { ...config, redirects }, redirectsPath }
    // @todo remove this failsafe once the code is stable
  } catch (error) {
    warnRedirectsParsing(logs, error.message)
    return { config: { ...config, redirects: [] }, redirectsPath }
  }
}

const REDIRECTS_FILENAME = '_redirects'

// When redirects are overridden with `inlineConfig`, they override
// everything, including file-based configuration like `_redirects`.
// This is useful when plugins change the configuration, since
// `inlineConfig.redirects` already include `_redirects` which was
// previously parsed
const getFileRedirects = async function (redirectsPath, redirectsOrigin) {
  return redirectsOrigin === INLINE_ORIGIN ? [] : await parseFileRedirects(redirectsPath)
}

module.exports = { addRedirects }
