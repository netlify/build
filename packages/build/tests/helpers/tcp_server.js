const { createServer } = require('net')
const { promisify } = require('util')

const { tmpName } = require('tmp-promise')

// Start a TCP server to mock calls.
const startTcpServer = async function({ response = '', timeout = false } = {}) {
  const requests = []
  const socketPath = await tmpName()
  const server = createServer(onConnection.bind(null, { response, requests, timeout }))
  await promisify(server.listen.bind(server))(socketPath)

  const stopServer = promisify(server.close.bind(server))
  return { socketPath, requests, stopServer }
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
