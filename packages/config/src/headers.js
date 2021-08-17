'use strict'

const { resolve } = require('path')

const { parseAllHeaders } = require('netlify-headers-parser')

const { warnHeadersParsing } = require('./log/messages')

// Retrieve path to `_headers` file (even if it does not exist yet)
const getHeadersPath = function ({ build: { publish } }) {
  return resolve(publish, HEADERS_FILENAME)
}

const HEADERS_FILENAME = '_headers'

// Add `config.headers`
const addHeaders = async function ({ headers: configHeaders, ...config }, headersPath, logs) {
  const { headers, errors } = await parseAllHeaders({
    headersFiles: [headersPath],
    configHeaders,
    minimal: true,
  })
  warnHeadersParsing(logs, errors)
  return { ...config, headers }
}

module.exports = { getHeadersPath, addHeaders }
