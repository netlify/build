import { resolve } from 'path'

import { warnRedirectsParsing } from './log/messages.js'

// TODO: use static `import` after migrating this repository to pure ES modules
const netlifyRedirectParser = import('netlify-redirect-parser')

// Retrieve path to `_redirects` file (even if it does not exist yet)
export const getRedirectsPath = function ({ build: { publish } }) {
  return resolve(publish, REDIRECTS_FILENAME)
}

const REDIRECTS_FILENAME = '_redirects'

// Add `config.redirects`
export const addRedirects = async function ({ redirects: configRedirects, ...config }, redirectsPath, logs) {
  const { parseAllRedirects } = await netlifyRedirectParser
  const { redirects, errors } = await parseAllRedirects({
    redirectsFiles: [redirectsPath],
    configRedirects,
    minimal: true,
  })
  warnRedirectsParsing(logs, errors)
  return { ...config, redirects }
}
