import { join, resolve } from 'path'
import { fileURLToPath } from 'url'

import test from 'ava'
import getPort from 'get-port'
import fetch from 'node-fetch'

import { serve } from '../src/index.js'

const url = new URL(import.meta.url)
const dirname = fileURLToPath(url)
const fixturesDir = resolve(dirname, '..', 'fixtures')

test.serial('bundler serving functionality', async (t) => {
  const port = await getPort()
  const server = await serve({
    port,
  })

  const { success } = await server(
    [
      {
        name: 'echo_env',
        path: join(fixturesDir, 'serve_test', 'echo_env.ts'),
      },
    ],
    {
      very_secret_secret: 'i love netlify',
    },
  )

  t.true(success)

  const response = await fetch(`http://0.0.0.0:${port}/foo`, {
    headers: {
      'x-deno-functions': 'echo_env',
      'x-deno-pass': 'passthrough',
      'X-NF-Request-ID': 'foo',
    },
  })
  t.is(response.status, 200)

  const body = (await response.json()) as Record<string, string>
  t.is(body.very_secret_secret, 'i love netlify')
})
