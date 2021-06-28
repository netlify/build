'use strict'

const { parseFileRedirects, mergeRedirects, normalizeRedirects } = require('netlify-redirect-parser')

const { warnRedirectsParsing } = require('./log/messages')
const { PLUGIN_ORIGIN } = require('./origin')

// Add `config.redirects`
const addRedirects = async function ({
  config,
  config: {
    build: { publish },
    redirects: configRedirects = [],
    redirectsOrigin,
  },
  logs,
  featureFlags,
}) {
  if (!featureFlags.netlify_config_redirects_parsing) {
    return { ...config, redirects: [] }
  }

  try {
    const fileRedirects = await getFileRedirects(publish, redirectsOrigin)
    const rawRedirects = mergeRedirects({ fileRedirects, configRedirects })
    const redirects = normalizeRedirects(rawRedirects)
    return { ...config, redirects }
    // @todo remove this failsafe once the code is stable
  } catch (error) {
    warnRedirectsParsing(logs, error.message)
    return { ...config, redirects: [] }
  }
}

// When redirects are overridden with `priorityConfig`, they override
// everything, including file-based configuration like `_redirects`.
// This is useful when plugins change the configuration, since
// `priorityConfig.redirects` already include `_redirects` which was
// previously parsed
const getFileRedirects = async function (publish, redirectsOrigin) {
  if (redirectsOrigin === PLUGIN_ORIGIN) {
    return []
  }

  return await parseFileRedirects(`${publish}/_redirects`)
}

module.exports = { addRedirects }
