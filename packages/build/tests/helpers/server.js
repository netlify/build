'use strict'

const { createServer } = require('http')
const { promisify } = require('util')

const getStream = require('get-stream')

const setTimeoutPromise = promisify(setTimeout)

// Start an HTTP server to mock API calls (telemetry server and Bitballoon)
// Tests are using child processes, so we cannot use `nock` or similar library
// that relies on monkey-patching global variables.
// Handlers can contain:
// path: path used to match the request
// response: json payload response (defaults to {})
// status: http status code (defaults to 200)
// wait: number used to induce a certain time delay in milliseconds in the response (defaults to undefined)
const startServer = async function (handler) {
  const handlers = Array.isArray(handler) ? handler : [handler]
  const requests = []
  const server = createServer((req, res) => requestHandler({ req, res, requests, handlers }))
  await promisify(server.listen.bind(server))(0)

  const host = getHost(server)

  const stopServer = promisify(server.close.bind(server))
  return { scheme: 'http', host, requests, stopServer }
}

const getHost = function (server) {
  const { port } = server.address()
  return `localhost:${port}`
}

const requestHandler = async function ({ req, req: { url, method, headers }, res, requests, handlers }) {
  const { response, status, wait } = getHandler(handlers, url)
  if (response === undefined) {
    res.end('')
    return
  }

  // Induce delays via wait property in handlers
  if (typeof wait === 'number') {
    await setTimeoutPromise(wait)
  }

  const requestBody = await getRequestBody(req)

  addRequestInfo({ url, method, headers, requests, requestBody })

  const responseBody = getResponseBody({ response, requestBody })

  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')

  res.end(responseBody)
}

const getHandler = function (handlers, url) {
  const handler = handlers.find(({ path }) => url === path || url.startsWith(`${path}?`))
  if (handler === undefined) {
    return {}
  }

  const { response = {}, status = DEFAULT_STATUS, wait } = handler
  return { response, status, wait }
}

const DEFAULT_STATUS = 200

const getRequestBody = async function (req) {
  const rawBody = await getStream(req)
  try {
    return JSON.parse(rawBody)
  } catch (error) {
    return rawBody
  }
}

const addRequestInfo = function ({ url, method, headers, requests, requestBody }) {
  const headersA = Object.keys(headers).sort().join(' ')
  requests.push({ url, method, headers: headersA, body: requestBody })
}

const getResponseBody = function ({ response, requestBody }) {
  const responseBody = typeof response === 'function' ? response(requestBody) : response
  return JSON.stringify(responseBody, null, 2)
}

module.exports = { startServer }
