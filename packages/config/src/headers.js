'use strict'

const { resolve } = require('path')

const { parseFileHeaders, mergeHeaders, normalizeHeaders } = require('netlify-headers-parser')

const { warnHeadersParsing, warnHeadersException } = require('./log/messages')

// Add `config.headers`
const addHeaders = async function (config, logs) {
  const headersPath = resolve(config.build.publish, HEADERS_FILENAME)
  const configWithHeaders = await addConfigHeaders(config, headersPath, logs)
  return { config: configWithHeaders, headersPath }
}

const HEADERS_FILENAME = '_headers'

const addConfigHeaders = async function ({ headers: configHeaders = [], ...config }, headersPath, logs) {
  try {
    const { headers: normalizedConfigHeaders, errors: configNormalizeErrors } = normalizeHeaders(configHeaders)
    const { normalizedFileHeaders, fileParseErrors, fileNormalizeErrors } = await getFileHeaders(headersPath)
    const { headers, errors: mergeErrors } = mergeHeaders({
      fileHeaders: normalizedFileHeaders,
      configHeaders: normalizedConfigHeaders,
    })
    const errors = [...configNormalizeErrors, ...fileParseErrors, ...fileNormalizeErrors, ...mergeErrors]
    warnHeadersParsing(logs, errors)
    return { ...config, headers }
    // @todo remove this failsafe once the code is stable
  } catch (error) {
    warnHeadersException(logs, error.message)
    return { ...config, headers: [] }
  }
}

const getFileHeaders = async function (headersPath) {
  const { headers: fileHeaders, errors: fileParseErrors } = await parseFileHeaders(headersPath)
  const { headers: normalizedFileHeaders, errors: fileNormalizeErrors } = normalizeHeaders(fileHeaders)
  return { normalizedFileHeaders, fileParseErrors, fileNormalizeErrors }
}

module.exports = { addHeaders, addConfigHeaders }
