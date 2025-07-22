import type { MinimalHeader } from './types.js'

// If one header fails to parse, we still try to return the other ones
export function splitResults<T>(results: (Error | T)[]) {
  const headers = results.filter((result): result is T => !isError(result))
  const errors = results.filter(isError)
  return { headers, errors }
}

const isError = function (result: unknown): result is Error {
  return result instanceof Error
}

// Concatenate an array of `{ headers, errors }`
export const concatResults = function (resultsArrays: { headers: MinimalHeader[]; errors: Error[] }[]) {
  const headers = resultsArrays.flatMap(({ headers }) => headers)
  const errors = resultsArrays.flatMap(({ errors }) => errors)
  return { headers, errors }
}
