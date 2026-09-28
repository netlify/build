import { randomBytes } from 'crypto'
import { createServer } from 'net'
import { tmpdir } from 'os'
import { join } from 'path'
import { promisify } from 'util'

import getPort from 'get-port'

interface TcpServerOptions<TRequest> {
  response?: unknown
  useUnixSocket?: boolean
  onRequest?: (request: TRequest) => void | Promise<void>
}

// Start a TCP server to mock calls.
export const startTcpServer = async function <TRequest>({
  response = '',
  useUnixSocket = true,
  onRequest = undefined,
}: TcpServerOptions<TRequest> = {}) {
  const requests: TRequest[] = []
  const { connectionOpts, address } = await getConnectionOpts({ useUnixSocket })
  const server = createServer(onConnection.bind(null, { response, requests, onRequest }))
  await promisify(server.listen.bind(server))(connectionOpts)

  const stopServer = promisify(server.close.bind(server))
  return { address, requests, stopServer }
}

const getConnectionOpts = async function ({ useUnixSocket }) {
  if (useUnixSocket) {
    const path = join(tmpdir(), `netlify-test-socket-${randomBytes(3).toString('hex')}`)
    return { connectionOpts: { path }, address: path }
  }

  const host = 'localhost'
  const port = await getPort()
  return { connectionOpts: { host, port }, address: `${host}:${port}` }
}

const onConnection = function ({ response, requests, onRequest }, socket) {
  socket.on('data', onNewRequest.bind(null, { response, requests, onRequest, socket }))
}

const onNewRequest = async function ({ response, requests, onRequest, socket }, data) {
  const json = typeof response !== 'string'
  const dataString = data.toString()
  const parsedData = json ? JSON.parse(dataString) : dataString
  requests.push(parsedData)

  if (onRequest !== undefined) {
    await onRequest(parsedData)
  }

  const serializedResponse = json ? JSON.stringify(response, null, 2) : response
  socket.write(serializedResponse)
}
