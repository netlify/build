'use strict'

const { createServer } = require('http')
const { promisify } = require('util')

const getStream = require('get-stream')

// Start an HTTP server to mock API calls (telemetry server and Bitballoon)
// Tests are using child processes, so we cannot use `nock` or similar library
// that relies on monkey-patching global variables.
const startServer = async function (handler) {
  const handlers = Array.isArray(handler) ? handler : [handler]
  const requests = []
  const server = createServer((req, res) => requestHandler({ req, res, requests, handlers }))
  await promisify(server.listen.bind(server))(0)

  const host = getHost(server)
  console.log({ host })

  const stopServer = promisify(server.close.bind(server))
  return { scheme: 'http', host, requests, stopServer }
}

const getHost = function (server) {
  const { port } = server.address()
  return `localhost:${port}`
}

const requestHandler = async function ({ req, req: { url, method, headers }, res, requests, handlers }) {
  console.log({ url })
  const { response, status } = getHandler(handlers, url)
  if (response === undefined) {
    res.end('')
    return
  }

  const requestBody = await getRequestBody(req)

  addRequestInfo({ method, headers, requests, requestBody })

  const responseBody = getResponseBody({ response, requestBody })

  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(responseBody)
}

const getHandler = function (handlers, url) {
  const handler = handlers.find(({ path }) => url === path)
  if (handler === undefined) {
    return {}
  }

  const { response = {}, status = DEFAULT_STATUS } = handler
  return { response, status }
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

const addRequestInfo = function ({ method, headers, requests, requestBody }) {
  const headersA = Object.keys(headers).sort().join(' ')
  requests.push({ method, headers: headersA, body: requestBody })
}

const getResponseBody = function ({ response, requestBody }) {
  const responseBody = typeof response === 'function' ? response(requestBody) : response
  return JSON.stringify(responseBody, null, 2)
}

module.exports = { startServer }
