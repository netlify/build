'use strict'

const { resolve } = require('path')
const { isDeepStrictEqual } = require('util')

const { parseFileHeaders, mergeHeaders, normalizeHeaders } = require('netlify-headers-parser')

const { warnHeadersParsing } = require('./log/messages')

// Add `config.headers`
const addHeaders = async function (config, logs) {
  const headersPath = resolve(config.build.publish, HEADERS_FILENAME)
  const configWithHeaders = await addConfigHeaders(config, headersPath, logs)
  return { config: configWithHeaders, headersPath }
}

const HEADERS_FILENAME = '_headers'

const addConfigHeaders = async function ({ headers: configHeaders = [], ...config }, headersPath, logs) {
  try {
    const normalizedConfigHeaders = normalizeHeaders(configHeaders)
    const normalizedFileHeaders = await getFileHeaders(headersPath, normalizedConfigHeaders)
    const headers = mergeHeaders({ fileHeaders: normalizedFileHeaders, configHeaders: normalizedConfigHeaders })
    return { ...config, headers }
    // @todo remove this failsafe once the code is stable
  } catch (error) {
    warnHeadersParsing(logs, error.message)
    return { ...config, headers: [] }
  }
}

const getFileHeaders = async function (headersPath, normalizedConfigHeaders) {
  const fileHeaders = await parseFileHeaders(headersPath)
  const normalizedFileHeaders = normalizeHeaders(fileHeaders)
  return hasMergedFileHeaders(normalizedFileHeaders, normalizedConfigHeaders) ? [] : normalizedFileHeaders
}

// `configHeaders` might contain the content of `_headers` already.
// This happens when a plugin appends to `netlifyConfig.headers` which already
// contains `_headers` rules and is transformed to an `inlineConfig` object,
// which is itself parsed as `configHeaders`. In that case, we do not want
// duplicate so we ignore `fileHeaders`.
// The current logic works with the case where `_headers` is added both before
// and after modifying `netlifyConfig.headers`.
const hasMergedFileHeaders = function (normalizedFileHeaders, normalizedConfigHeaders) {
  return normalizedConfigHeaders.some((configHeader) =>
    normalizedFileHeaders.some((fileHeader) => isDeepStrictEqual(configHeader, fileHeader)),
  )
}

module.exports = { addHeaders, addConfigHeaders }
