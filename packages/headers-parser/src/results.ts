import type { Header } from './types.js'

// If one header fails to parse, we still try to return the other ones
export function splitResults<Type>(results: (Error | Type)[]) {
  const headers = results.filter((result) => !isError(result)) as Type[]
  const errors = results.filter(isError)
  return { headers, errors }
}

const isError = function (result: any): result is Error {
  return result instanceof Error
}

// Concatenate an array of `{ headers, errors }`
export const concatResults = function (resultsArrays: { headers: Header[]; errors: Error[] }[]) {
  const headers = resultsArrays.flatMap(({ headers }) => headers)
  const errors = resultsArrays.flatMap(({ errors }) => errors)
  return { headers, errors }
}
