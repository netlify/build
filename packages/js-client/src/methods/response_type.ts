export type ResponseType = 'json' | 'text'

export const getResponseType = function ({ headers }): ResponseType {
  const contentType = headers.get('Content-Type')

  if (contentType != null && contentType.includes('json')) {
    return 'json'
  }

  return 'text'
}
