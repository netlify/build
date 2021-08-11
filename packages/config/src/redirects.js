'use strict'

const { resolve } = require('path')
const { isDeepStrictEqual } = require('util')

const { parseFileRedirects, mergeRedirects, normalizeRedirects } = require('netlify-redirect-parser')

const { warnRedirectsParsing } = require('./log/messages')

// Add `config.redirects`
const addRedirects = async function (config, logs) {
  const redirectsPath = resolve(config.build.publish, REDIRECTS_FILENAME)
  const configWithRedirects = await addConfigRedirects(config, redirectsPath, logs)
  return { config: configWithRedirects, redirectsPath }
}

const REDIRECTS_FILENAME = '_redirects'

const addConfigRedirects = async function ({ redirects: configRedirects = [], ...config }, redirectsPath, logs) {
  try {
    const normalizedConfigRedirects = normalizeAllRedirects(configRedirects)
    const normalizedFileRedirects = await getFileRedirects(redirectsPath, normalizedConfigRedirects)
    const redirects = mergeRedirects({
      fileRedirects: normalizedFileRedirects,
      configRedirects: normalizedConfigRedirects,
    })
    return { ...config, redirects }
    // @todo remove this failsafe once the code is stable
  } catch (error) {
    warnRedirectsParsing(logs, error.message)
    return { ...config, redirects: [] }
  }
}

const getFileRedirects = async function (redirectsPath, normalizedConfigRedirects) {
  const fileRedirects = await parseFileRedirects(redirectsPath)
  const normalizedFileRedirects = normalizeAllRedirects(fileRedirects)
  return hasMergedFileRedirects(normalizedFileRedirects, normalizedConfigRedirects) ? [] : normalizedFileRedirects
}

const normalizeAllRedirects = function (redirects) {
  return normalizeRedirects(redirects, { minimal: true })
}

// `configRedirects` might contain the content of `_redirects` already.
// This happens when a plugin appends to `netlifyConfig.redirects` which already
// contains `_redirects` rules and is transformed to an `inlineConfig` object,
// which is itself parsed as `configRedirects`. In that case, we do not want
// duplicate so we ignore `fileRedirects`.
// The current logic works with the case where `_redirects` is added both before
// and after modifying `netlifyConfig.redirects`.
const hasMergedFileRedirects = function (normalizedFileRedirects, normalizedConfigRedirects) {
  return normalizedConfigRedirects.some((configRedirect) =>
    normalizedFileRedirects.some((fileRedirect) => isDeepStrictEqual(configRedirect, fileRedirect)),
  )
}

module.exports = { addRedirects, addConfigRedirects }
