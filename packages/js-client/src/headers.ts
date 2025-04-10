export type HeadersObject = Record<string, string>

/**
 * Serializes a `Headers` object into a plain object.
 */
export const getHeadersObject = (headers: Headers) => {
  const obj: HeadersObject = {}

  for (const [key, value] of headers.entries()) {
    obj[key] = value
  }

  return obj
}
