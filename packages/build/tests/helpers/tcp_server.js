import { createServer } from 'net'
import { promisify } from 'util'

import getPort from 'get-port'
import { tmpName } from 'tmp-promise'

// Start a TCP server to mock calls.
export const startTcpServer = async function ({ response = '', useUnixSocket = true } = {}) {
  const requests = []
  const { connectionOpts, address } = await getConnectionOpts({ useUnixSocket })
  const server = createServer(onConnection.bind(null, { response, requests }))
  await promisify(server.listen.bind(server))(connectionOpts)

  const stopServer = promisify(server.close.bind(server))
  return { address, requests, stopServer }
}

const getConnectionOpts = async function ({ useUnixSocket }) {
  if (useUnixSocket) {
    const path = await tmpName({ template: 'netlify-test-socket-XXXXXX' })
    return { connectionOpts: { path }, address: path }
  }

  const host = 'localhost'
  const port = await getPort()
  return { connectionOpts: { host, port }, address: `${host}:${port}` }
}

const onConnection = function ({ response, requests }, socket) {
  socket.on('data', onNewRequest.bind(null, { response, requests, socket }))
}

const onNewRequest = function ({ response, requests, socket }, data) {
  const json = typeof response !== 'string'
  const dataString = data.toString()
  const parsedData = json ? JSON.parse(dataString) : dataString
  requests.push(parsedData)

  const serializedResponse = json ? JSON.stringify(response, null, 2) : response
  socket.write(serializedResponse)
}
