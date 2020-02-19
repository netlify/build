const { createServer } = require('http')
const { promisify } = require('util')

// Start an HTTP server to mock telemetry server.
// Tests are using child processes, so we cannot use `nock` or similar library
// that relies on monkey-patching global variables.
const startServer = async function() {
  const request = {}
  const server = createServer((req, res) => requestHandler(req, res, request))
  await promisify(server.listen.bind(server))(0)
  const port = server.address().port
  const url = `http://localhost:${port}/collect`
  const stopServerA = stopServer.bind(null, server)
  return { url, request, stopServer: stopServerA }
}

const requestHandler = function(req, res, request) {
  const { method, url, headers } = req
  req.on('data', data => {
    const body = JSON.parse(data.toString())
    Object.assign(request, { method, url, headers, body })
  })
  req.on('end', () => {
    res.end('')
  })
}

const stopServer = async function(server) {
  await promisify(server.close.bind(server))()
}

module.exports = { startServer }
