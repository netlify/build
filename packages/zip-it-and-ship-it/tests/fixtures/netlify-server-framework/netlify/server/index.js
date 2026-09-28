import { createServer } from 'node:http'

import { greeting } from './helpers/greeting.js'

// A framework server exports nothing. It starts listening as a side effect of
// being imported, which is how Express and Hono apps are written.
createServer((_req, res) => {
  res.end(greeting)
}).listen(3000)
