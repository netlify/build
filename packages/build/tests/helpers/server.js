const { createServer } = require('http')
const { promisify } = require('util')

// Start an HTTP server to mock API calls (telemetry server and Bitballoon)
// Tests are using child processes, so we cannot use `nock` or similar library
// that relies on monkey-patching global variables.
const startServer = async function (path, response = {}) {
  const request = { sent: false, headers: {}, body: {} }
  const server = createServer((req, res) => requestHandler({ req, res, request, response, path }))
  await promisify(server.listen.bind(server))(0)

  const host = getHost(server)

  const stopServer = promisify(server.close.bind(server))
  return { scheme: 'http', host, request, stopServer }
}

const getHost = function (server) {
  const port = server.address().port
  return `localhost:${port}`
}

const requestHandler = function ({ req, res, request, response, path }) {
  let rawBody = ''
  req.on('data', data => {
    rawBody += data.toString()
  })
  req.on('end', () => {
    onRequestEnd({ req, res, request, response, path, rawBody })
  })
}

const onRequestEnd = function ({ req: { method, url, headers }, res, request, response, path, rawBody }) {
  addRequestInfo({ method, url, headers, request, path, rawBody })
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(response))
}

const addRequestInfo = function ({ method, url, headers, request, path, rawBody }) {
  if (url !== path) {
    return
  }

  const body = parseBody(rawBody)
  const headersA = Object.keys(headers).sort()
  Object.assign(request, { sent: true, method, headers: headersA, body })
}

const parseBody = function (rawBody) {
  try {
    return JSON.parse(rawBody)
  } catch (error) {
    return rawBody
  }
}

module.exports = { startServer }
