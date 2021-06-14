'use strict'

const { parseFileRedirects, mergeRedirects, normalizeRedirects } = require('netlify-redirect-parser')

const { warnRedirectsParsing } = require('./log/messages')

// Add `config.redirects`
const addRedirects = async function ({ config, buildDir, logs, featureFlags }) {
  if (!featureFlags.netlify_config_redirects_parsing) {
    return { ...config, redirects: [] }
  }

  const publishDir = getPublishDir(buildDir, config)
  try {
    const fileRedirects = await parseFileRedirects(`${publishDir}/_redirects`)
    const configRedirects = getConfigRedirects(config)
    const rawRedirects = mergeRedirects({ fileRedirects, configRedirects })
    const redirects = normalizeRedirects(rawRedirects)
    return { ...config, redirects }
    // @todo remove this failsafe once the code is stable
  } catch (error) {
    warnRedirectsParsing(logs, error.message)
    return { ...config, redirects: [] }
  }
}

// @todo remove `= buildDir` default value  once
// `featureFlags.netlify_config_default_publish` is removed
const getPublishDir = function (buildDir, { build: { publish = buildDir } }) {
  return publish
}

const getConfigRedirects = function ({ redirects = [] }) {
  return redirects
}

module.exports = { addRedirects }
