'use strict'

const { resolve } = require('path')

const { parseAllHeaders } = require('netlify-headers-parser')

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
    const { headers, errors } = await parseAllHeaders({ headersFiles: [headersPath], configHeaders })
    warnHeadersParsing(logs, errors)
    return { ...config, headers }
    // @todo remove this failsafe once the code is stable
  } catch (error) {
    warnHeadersException(logs, error.message)
    return { ...config, headers: [] }
  }
}

module.exports = { addHeaders, addConfigHeaders }
