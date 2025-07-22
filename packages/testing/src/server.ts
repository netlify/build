import { createServer, Server, IncomingMessage, ServerResponse } from 'http'
import type { AddressInfo } from 'net'
import { promisify } from 'util'

import getStream from 'get-stream'

type Handler = { path: string; response?: object; status?: number; wait?: number }
export type ServerHandler = Handler | Handler[]

export type Request = {
  url: string
  method: string
  headers: string
  body: string | object
}

const DEFAULT_STATUS = 200

const setTimeoutPromise = promisify(setTimeout)

// Start an HTTP server to mock API calls (telemetry server and Bitballoon)
// Tests are using child processes, so we cannot use `nock` or similar library
// that relies on monkey-patching global variables.
// Handlers can contain:
// path: path used to match the request
// response: json payload response (defaults to {})
// status: http status code (defaults to 200)
// wait: number used to induce a certain time delay in milliseconds in the response (defaults to undefined)
export const startServer = async (handler: ServerHandler, port = 0) => {
  const handlers = Array.isArray(handler) ? handler : [handler]
  const requests: Request[] = []

  const server = createServer((req, res) => requestHandler(req, res, requests, handlers))
  await promisify(server.listen.bind(server))(port)

  const host = getHost(server)

  const stopServer = promisify(server.close.bind(server))
  return { scheme: 'http', host, requests, stopServer }
}

const getHost = (server: Server<typeof IncomingMessage, typeof ServerResponse>): string => {
  const { port } = server.address() as AddressInfo
  return `localhost:${port}`
}

const requestHandler = async (req: IncomingMessage, res: ServerResponse, requests: Request[], handlers: Handler[]) => {
  const { response, status, wait } = getHandler(handlers, req.url)
  if (response === undefined) {
    res.end('')
    return
  }

  // Induce delays via wait property in handlers
  if (typeof wait === 'number') {
    await setTimeoutPromise(wait)
  }

  const requestBody = await getRequestBody(req as any)

  const headersA = Object.keys(req.headers).sort().join(' ')
  if (req.url && req.method) {
    requests.push({ url: req.url, method: req.method, headers: headersA, body: requestBody })
  }

  const responseBody = getResponseBody(response, requestBody)
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')

  res.end(responseBody)
}

const getHandler = function (handlers: Handler[], url?: string) {
  const handler = handlers.find(({ path }) => url === path || url?.startsWith(`${path}?`))
  if (handler === undefined) {
    return {}
  }

  const { response = {}, status = DEFAULT_STATUS, wait } = handler
  return { response, status, wait }
}

const getRequestBody = async (req: IncomingMessage): Promise<string | object> => {
  const rawBody = await getStream(req)
  try {
    return JSON.parse(rawBody)
  } catch {
    return rawBody
  }
}

const getResponseBody = (response, requestBody: string | object) => {
  const responseBody = typeof response === 'function' ? response(requestBody) : response
  return JSON.stringify(responseBody, null, 2)
}
