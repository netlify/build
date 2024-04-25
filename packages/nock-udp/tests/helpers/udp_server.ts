import { createSocket } from 'dgram'

export const createServer = function ({ port }) {
  const server = createSocket('udp4')
  let buffers = []

  const getMessages = () =>
    new Promise((resolve) => {
      if (buffers.length !== 0) {
        resolve(buffers)
        buffers = []
        return
      }
      server.once('message', (msg) => resolve([msg]))
    })

  server.on('error', (err) => {
    server.close()
    throw err
  })

  server.bind(port)

  return { server, getMessages }
}
