import { createServer } from 'node:http'

createServer((_req, res) => {
  res.end('Hello from the server')
}).listen(process.env.PORT)

export const config = {
  path: '/api/*',
  region: 'fra',
}
