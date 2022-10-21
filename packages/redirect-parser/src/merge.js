import { isDeepStrictEqual } from 'util'

import { splitResults } from './results.js'

// Merge redirects from `_redirects` with the ones from `netlify.toml`.
// When both are specified, both are used and `_redirects` has priority.
// Since in both `netlify.toml` and `_redirects`, only the first matching rule
// is used, it is possible to merge `_redirects` to `netlify.toml` by prepending
// its rules to `netlify.toml` `redirects` field.
export const mergeRedirects = function ({ fileRedirects, configRedirects }) {
  const results = [...fileRedirects, ...configRedirects]
  const { redirects, errors } = splitResults(results)
  const mergedRedirects = removeDuplicates(redirects)
  return { redirects: mergedRedirects, errors }
}

// Remove duplicates. This is especially likely considering `fileRedirects`
// might have been previously merged to `configRedirects`, which happens when
// `netlifyConfig.redirects` is modified by plugins.
// The latest duplicate value is the one kept, hence why we need to reverse the
// arrays in order to keep said logic.
const removeDuplicates = function (redirects) {
  const strRedirects = redirects.map((v) => JSON.stringify(v)).reverse()
  // Set takes care of creating a set of non duplicate values and preserves order
  const set = new Set(strRedirects)
  return [...set].map((v) => JSON.parse(v)).reverse()
}
