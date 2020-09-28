const { createServer } = require('net')
const { promisify } = require('util')

const getPort = require('get-port')
const { tmpName } = require('tmp-promise')

// Start a TCP server to mock calls.
const startTcpServer = async function({ response = '', useUnixSocket = true, timeout = false } = {}) {
  const requests = []
  const { connectionOpts, address } = await getConnectionOpts({ useUnixSocket })
  const server = createServer(onConnection.bind(null, { response, requests, timeout }))
  await promisify(server.listen.bind(server))(connectionOpts)

  const stopServer = promisify(server.close.bind(server))
  return { address, requests, stopServer }
}

const getConnectionOpts = async function({ useUnixSocket }) {
  if (useUnixSocket) {
    const path = await tmpName()
    return { connectionOpts: { path }, address: path }
  }

  const host = 'localhost'
  const port = await getPort()
  return { connectionOpts: { host, port }, address: `${host}:${port}` }
}

const onConnection = function({ response, requests, timeout }, socket) {
  socket.on('data', onRequest.bind(null, { response, requests, timeout, socket }))
}

const onRequest = function({ response, requests, timeout, socket }, data) {
  const json = typeof response !== 'string'
  const dataString = data.toString()
  const parsedData = json ? JSON.parse(dataString) : dataString
  requests.push(parsedData)

  if (timeout) {
    return
  }

  const serializedResponse = json ? JSON.stringify(response, null, 2) : response
  socket.write(serializedResponse)
}

module.exports = { startTcpServer }
