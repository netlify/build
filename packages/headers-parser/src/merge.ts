import stringify from 'fast-safe-stringify'

import { splitResults } from './results.js'
import type { Header, MinimalHeader } from './types.js'

// Merge headers from `_headers` with the ones from `netlify.toml`.
// When:
//  - Both `netlify.toml` headers and `_headers` are specified, paths are
//    merged. If the same path is specified in both, their headers are merged.
//    If the same path and header is specified both in `netlify.toml` and
//    `_headers`, the one in `netlify.toml` is used (i.e. overrides, does not
//    concatenate).
//  - The same path is specified twice in `netlify.toml` headers, their headers
//    are merged. If the same header is specified twice in different places for
//    the same path, the later one overrides (does not concatenate) any earlier
//    ones. If the same header is specified twice in the same place for the same
//    path, it is concatenated as a comma-separated list string.
//  - The same path is specified twice in `_headers`, the behavior is the same
//    as `netlify.toml` headers.
export const mergeHeaders = function ({
  fileHeaders,
  configHeaders,
}: {
  fileHeaders: MinimalHeader[] | Header[]
  configHeaders: MinimalHeader[] | Header[]
}) {
  const results = [...fileHeaders, ...configHeaders]
  const { headers, errors } = splitResults(results)
  const mergedHeaders = removeDuplicates(headers)
  return { headers: mergedHeaders, errors }
}

// Remove duplicates. This is especially likely considering `fileHeaders` might
// have been previously merged to `configHeaders`, which happens when
// `netlifyConfig.headers` is modified by plugins.
// The latest duplicate value is the one kept, hence why we need to iterate the
// array backwards and reverse it at the end
const removeDuplicates = function (headers: MinimalHeader[] | Header[]) {
  const uniqueHeaders = new Set()
  const result: (MinimalHeader | Header)[] = []
  for (const header of [...headers].reverse()) {
    const key = generateHeaderKey(header)
    if (uniqueHeaders.has(key)) continue
    uniqueHeaders.add(key)
    result.push(header)
  }
  return result.reverse()
}

// We generate a unique header key based on JSON stringify. However, because some
// properties can be regexes, we need to replace those by their toString representation
// given the default will be and empty object
const generateHeaderKey = function (header: MinimalHeader | Header): string {
  return stringify.default.stableStringify(header, (_, value) => {
    if (value instanceof RegExp) return value.toString()
    return value
  })
}
