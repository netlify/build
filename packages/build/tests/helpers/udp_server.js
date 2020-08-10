const { createSocket } = require('dgram')
const { promisify } = require('util')

// Start an UDP server to mock calls.
const startUdpServer = async function() {
  const requests = []
  const server = createSocket('udp4', buffer => {
    requests.push(buffer.toString())
  })
  await promisify(server.bind.bind(server))(0)
  const { address, port } = server.address()

  const stopServer = promisify(server.close.bind(server))
  return { host: address, port, requests, stopServer }
}

module.exports = { startUdpServer }
