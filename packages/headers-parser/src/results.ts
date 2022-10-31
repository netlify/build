import type { Header } from './types.js'

// If one header fails to parse, we still try to return the other ones
export function splitResults<Type>(results: (Error | Type)[]) {
  const headers = results.filter((result) => !isError(result)) as Type[]
  const errors = results.filter(isError) as Error[]
  return { headers, errors }
}

const isError = function (result: Error | any) {
  return result instanceof Error
}

// Concatenate an array of `{ headers, erors }`
export const concatResults = function (resultsArrays: { headers: Header[]; errors: Error[] }[]) {
  const headers = resultsArrays.flatMap(getHeaders) as Header[]
  const errors = resultsArrays.flatMap(getErrors) as Error[]
  return { headers, errors }
}

const getHeaders = function ({ headers }) {
  return headers
}

const getErrors = function ({ errors }) {
  return errors
}
