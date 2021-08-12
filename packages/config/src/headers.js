'use strict'

const { resolve } = require('path')

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
    return { ...config, headers }
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

module.exports = { addHeaders, addConfigHeaders }
