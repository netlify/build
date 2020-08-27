const { createServer } = require('http')
const { promisify } = require('util')

// Start an HTTP server to mock API calls (telemetry server and Bitballoon)
// Tests are using child processes, so we cannot use `nock` or similar library
// that relies on monkey-patching global variables.
const startServer = async function(path, response = {}, { status = 200 } = {}) {
  const requests = []
  const server = createServer((req, res) => requestHandler({ req, res, requests, response, status, path }))
  await promisify(server.listen.bind(server))(0)

  const host = getHost(server)

  const stopServer = promisify(server.close.bind(server))
  return { scheme: 'http', host, requests, stopServer }
}

const getHost = function(server) {
  const port = server.address().port
  return `localhost:${port}`
}

const requestHandler = function({ req, res, requests, response, status, path }) {
  // A stateful variable is required due to `http` using events
  // eslint-disable-next-line fp/no-let
  let rawBody = ''
  req.on('data', data => {
    rawBody += data.toString()
  })
  req.on('end', () => {
    onRequestEnd({ req, res, requests, response, status, path, rawBody })
  })
}

const onRequestEnd = function({ req: { method, url, headers }, res, requests, response, status, path, rawBody }) {
  addRequestInfo({ method, url, headers, requests, path, rawBody })
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(response))
}

const addRequestInfo = function({ method, url, headers, requests, path, rawBody }) {
  if (url !== path) {
    return
  }

  const body = parseBody(rawBody)
  const headersA = Object.keys(headers)
    .sort()
    .join(' ')
  requests.push({ method, headers: headersA, body })
}

const parseBody = function(rawBody) {
  try {
    return JSON.parse(rawBody)
  } catch (error) {
    return rawBody
  }
}

module.exports = { startServer }
