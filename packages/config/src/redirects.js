'use strict'

const { resolve } = require('path')

const { parseFileRedirects, mergeRedirects, normalizeRedirects } = require('netlify-redirect-parser')

const { warnRedirectsParsing, warnRedirectsException } = require('./log/messages')

// Add `config.redirects`
const addRedirects = async function (config, logs) {
  const redirectsPath = resolve(config.build.publish, REDIRECTS_FILENAME)
  const configWithRedirects = await addConfigRedirects(config, redirectsPath, logs)
  return { config: configWithRedirects, redirectsPath }
}

const REDIRECTS_FILENAME = '_redirects'

const addConfigRedirects = async function ({ redirects: configRedirects = [], ...config }, redirectsPath, logs) {
  try {
    const { redirects: normalizedConfigRedirects, errors: configNormalizeErrors } =
      normalizeAllRedirects(configRedirects)
    const { normalizedFileRedirects, fileParseErrors, fileNormalizeErrors } = await getFileRedirects(redirectsPath)
    const { redirects, errors: mergeErrors } = mergeRedirects({
      fileRedirects: normalizedFileRedirects,
      configRedirects: normalizedConfigRedirects,
    })
    const errors = [...configNormalizeErrors, ...fileParseErrors, ...fileNormalizeErrors, ...mergeErrors]
    warnRedirectsParsing(logs, errors)
    return { ...config, redirects }
    // @todo remove this failsafe once the code is stable
  } catch (error) {
    warnRedirectsException(logs, error.message)
    return { ...config, redirects: [] }
  }
}

const getFileRedirects = async function (redirectsPath) {
  const { redirects: fileRedirects, errors: fileParseErrors } = await parseFileRedirects(redirectsPath)
  const { redirects: normalizedFileRedirects, errors: fileNormalizeErrors } = normalizeAllRedirects(fileRedirects)
  return { normalizedFileRedirects, fileParseErrors, fileNormalizeErrors }
}

const normalizeAllRedirects = function (redirects) {
  return normalizeRedirects(redirects, { minimal: true })
}

module.exports = { addRedirects, addConfigRedirects }
