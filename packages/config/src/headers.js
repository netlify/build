import { resolve } from 'path'

import { warnHeadersParsing, warnHeadersCaseSensitivity } from './log/messages.js'

// TODO: use static `import` after migrating this repository to pure ES modules
const netlifyHeadersParser = import('netlify-headers-parser')

// Retrieve path to `_headers` file (even if it does not exist yet)
export const getHeadersPath = function ({ build: { publish } }) {
  return resolve(publish, HEADERS_FILENAME)
}

const HEADERS_FILENAME = '_headers'

// Add `config.headers`
export const addHeaders = async function ({ headers: configHeaders, ...config }, headersPath, logs) {
  const { parseAllHeaders } = await netlifyHeadersParser
  const { headers, errors } = await parseAllHeaders({
    headersFiles: [headersPath],
    configHeaders,
    minimal: true,
  })
  warnHeadersParsing(logs, errors)
  warnHeadersCaseSensitivity(logs, headers)
  return { ...config, headers }
}
