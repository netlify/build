import { getHeadersObject, HeadersObject } from './headers.js'
import { getResponseType } from './methods/response_type.js'

type JSONResponse = { type: 'json'; body: any }
type TextResponse = { type: 'text'; body: string }

/**
 * An HTTP response that has been fully read. The body has been buffered and so
 * it can be read multiple times and serialized to disk.
 */
export type BufferedResponse = { headers: HeadersObject; timestamp: number } & (JSONResponse | TextResponse)

/**
 * Consumes an HTTP response and returns a `BufferedResponse` object.
 */
export const getBufferedResponse = async (res: Response): Promise<BufferedResponse> => {
  const headers = getHeadersObject(res.headers)
  const data = {
    headers,
    timestamp: Date.now(),
  }
  const type = getResponseType(res)

  if (type === 'json') {
    return {
      ...data,
      type: 'json',
      body: await res.json(),
    }
  }

  return { ...data, type: 'text', body: await res.text() }
}
