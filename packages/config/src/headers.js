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
    const normalizedFileHeaders = await getFileHeaders(headersPath)
    const headers = mergeHeaders({ fileHeaders: normalizedFileHeaders, configHeaders: normalizedConfigHeaders })
    const uniqueHeaders = headers.filter(isUniqueHeader)
    return { ...config, headers: uniqueHeaders }
    // @todo remove this failsafe once the code is stable
  } catch (error) {
    warnHeadersParsing(logs, error.message)
    return { ...config, headers: [] }
  }
}

const getFileHeaders = async function (headersPath) {
  const fileHeaders = await parseFileHeaders(headersPath)
  const normalizedFileHeaders = normalizeHeaders(fileHeaders)
  return normalizedFileHeaders
}

// `configHeaders` might contain the content of `_headers` already.
// This happens when a plugin appends to `netlifyConfig.headers` which already
// contains `_headers` rules and is transformed to an `inlineConfig` object,
// which is itself parsed as `configHeaders`. In that case, we do not want
// duplicates.
const isUniqueHeader = function (header, index, headers) {
  return !headers.slice(index + 1).some((otherHeader) => isDeepStrictEqual(header, otherHeader))
}

module.exports = { addHeaders, addConfigHeaders }
