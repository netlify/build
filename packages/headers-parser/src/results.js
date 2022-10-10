// If one header fails to parse, we still try to return the other ones
export const splitResults = function (results) {
  const headers = results.filter((result) => !isError(result))
  const errors = results.filter(isError)
  return { headers, errors }
}

const isError = function (result) {
  return result instanceof Error
}

// Concatenate an array of `{ headers, erors }`
export const concatResults = function (resultsArrays) {
  const headers = resultsArrays.flatMap(getHeaders)
  const errors = resultsArrays.flatMap(getErrors)
  return { headers, errors }
}

const getHeaders = function ({ headers }) {
  return headers
}

const getErrors = function ({ errors }) {
  return errors
}
