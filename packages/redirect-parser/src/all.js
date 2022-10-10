import { parseFileRedirects } from './line_parser.js'
import { mergeRedirects } from './merge.js'
import { parseConfigRedirects } from './netlify_config_parser.js'
import { normalizeRedirects } from './normalize.js'
import { splitResults, concatResults } from './results.js'

// Parse all redirects given programmatically via the `configRedirects` property, `netlify.toml` and `_redirects` files, then normalize
// and validate those.
export const parseAllRedirects = async function ({
  redirectsFiles = [],
  netlifyConfigPath,
  configRedirects = [],
  minimal = false,
}) {
  const [
    { redirects: fileRedirects, errors: fileParseErrors },
    { redirects: parsedConfigRedirects, errors: configParseErrors },
  ] = await Promise.all([getFileRedirects(redirectsFiles), getConfigRedirects(netlifyConfigPath)])
  const { redirects: normalizedFileRedirects, errors: fileNormalizeErrors } = normalizeRedirects(fileRedirects, minimal)
  const { redirects: normalizedParsedConfigRedirects, errors: parsedConfigNormalizeErrors } = normalizeRedirects(
    parsedConfigRedirects,
    minimal,
  )
  const { redirects: normalizedConfigRedirects, errors: configNormalizeErrors } = normalizeRedirects(
    configRedirects,
    minimal,
  )
  const { redirects, errors: mergeErrors } = mergeRedirects({
    fileRedirects: normalizedFileRedirects,
    configRedirects: [...normalizedParsedConfigRedirects, ...normalizedConfigRedirects],
  })
  const errors = [
    ...fileParseErrors,
    ...fileNormalizeErrors,
    ...configParseErrors,
    ...parsedConfigNormalizeErrors,
    ...configNormalizeErrors,
    ...mergeErrors,
  ]
  return { redirects, errors }
}

const getFileRedirects = async function (redirectsFiles) {
  const resultsArrays = await Promise.all(redirectsFiles.map((redirectFile) => parseFileRedirects(redirectFile)))
  return concatResults(resultsArrays)
}

const getConfigRedirects = async function (netlifyConfigPath) {
  if (netlifyConfigPath === undefined) {
    return splitResults([])
  }

  return await parseConfigRedirects(netlifyConfigPath)
}
