import { parseFileHeaders } from './line_parser.js'
import { mergeHeaders } from './merge.js'
import { parseConfigHeaders } from './netlify_config_parser.js'
import { normalizeHeaders } from './normalize.js'
import { splitResults, concatResults } from './results.js'

// Parse all headers from `netlify.toml` and `_headers` file, then normalize
// and validate those.
export const parseAllHeaders = async function ({
  headersFiles = [],
  netlifyConfigPath,
  configHeaders = [],
  minimal = false,
}) {
  const [
    { headers: fileHeaders, errors: fileParseErrors },
    { headers: parsedConfigHeaders, errors: configParseErrors },
  ] = await Promise.all([getFileHeaders(headersFiles), getConfigHeaders(netlifyConfigPath)])
  const { headers: normalizedFileHeaders, errors: fileNormalizeErrors } = normalizeHeaders(fileHeaders, minimal)
  const { headers: normalizedConfigParseHeaders, errors: configParseNormalizeErrors } = normalizeHeaders(
    parsedConfigHeaders,
    minimal,
  )
  const { headers: normalizedConfigHeaders, errors: configNormalizeErrors } = normalizeHeaders(configHeaders, minimal)
  const { headers, errors: mergeErrors } = mergeHeaders({
    fileHeaders: normalizedFileHeaders,
    configHeaders: [...normalizedConfigParseHeaders, ...normalizedConfigHeaders],
  })
  const errors = [
    ...fileParseErrors,
    ...fileNormalizeErrors,
    ...configParseErrors,
    ...configParseNormalizeErrors,
    ...configNormalizeErrors,
    ...mergeErrors,
  ]
  return { headers, errors }
}

const getFileHeaders = async function (headersFiles) {
  const resultsArrays = await Promise.all(headersFiles.map(parseFileHeaders))
  return concatResults(resultsArrays)
}

const getConfigHeaders = async function (netlifyConfigPath) {
  if (netlifyConfigPath === undefined) {
    return splitResults([])
  }

  return await parseConfigHeaders(netlifyConfigPath)
}
