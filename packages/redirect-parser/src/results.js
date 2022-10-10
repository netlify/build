// If one redirect fails to parse, we still try to return the other ones
export const splitResults = function (results) {
  const redirects = results.filter((result) => !isError(result))
  const errors = results.filter(isError)
  return { redirects, errors }
}

const isError = function (result) {
  return result instanceof Error
}

// Concatenate an array of `{ redirects, erors }`
export const concatResults = function (resultsArrays) {
  const redirects = resultsArrays.flatMap(getRedirects)
  const errors = resultsArrays.flatMap(getErrors)
  return { redirects, errors }
}

const getRedirects = function ({ redirects }) {
  return redirects
}

const getErrors = function ({ errors }) {
  return errors
}
