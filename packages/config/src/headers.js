import { resolve } from 'path'

import { parseAllHeaders } from 'netlify-headers-parser'

import { warnHeadersParsing, warnHeadersCaseSensitivity } from './log/messages.js'

// Retrieve path to `_headers` file (even if it does not exist yet)
export const getHeadersPath = function ({ build: { publish } }) {
  return resolve(publish, HEADERS_FILENAME)
}

const HEADERS_FILENAME = '_headers'

// Add `config.headers`
export const addHeaders = async function ({
  config: { headers: configHeaders, ...config },
  headersPath,
  logs,
  featureFlags,
}) {
  const { headers, errors } = await parseAllHeaders({
    headersFiles: [headersPath],
    configHeaders,
    minimal: true,
    featureFlags,
  })
  warnHeadersParsing(logs, errors)
  warnHeadersCaseSensitivity(logs, headers)
  return { ...config, headers }
}
