'use strict'

const { resolve } = require('path')

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
    const normalizedFileRedirects = await getFileRedirects(redirectsPath)
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

const getFileRedirects = async function (redirectsPath) {
  const fileRedirects = await parseFileRedirects(redirectsPath)
  const normalizedFileRedirects = normalizeAllRedirects(fileRedirects)
  return normalizedFileRedirects
}

const normalizeAllRedirects = function (redirects) {
  return normalizeRedirects(redirects, { minimal: true })
}

module.exports = { addRedirects, addConfigRedirects }
