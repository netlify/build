'use strict'

const { parseFileRedirects, mergeRedirects, normalizeRedirects } = require('netlify-redirect-parser')

const { warnRedirectsParsing } = require('./log/messages')

// Add `config.redirects`
const addRedirects = async function ({
  config,
  config: {
    build: { publish },
    redirects: configRedirects = [],
  },
  logs,
  featureFlags,
}) {
  if (!featureFlags.netlify_config_redirects_parsing) {
    return { ...config, redirects: [] }
  }

  try {
    const fileRedirects = await parseFileRedirects(`${publish}/_redirects`)
    const rawRedirects = mergeRedirects({ fileRedirects, configRedirects })
    const redirects = normalizeRedirects(rawRedirects)
    return { ...config, redirects }
    // @todo remove this failsafe once the code is stable
  } catch (error) {
    warnRedirectsParsing(logs, error.message)
    return { ...config, redirects: [] }
  }
}

module.exports = { addRedirects }
