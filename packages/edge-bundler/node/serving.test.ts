import { join } from 'path'

import getPort from 'get-port'
import fetch from 'node-fetch'
import { test, expect } from 'vitest'

import { fixturesDir } from '../test/util.js'

import { serve } from './index.js'

test('bundler serving functionality', async () => {
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

  expect(success).toBe(true)

  const response = await fetch(`http://0.0.0.0:${port}/foo`, {
    headers: {
      'x-deno-functions': 'echo_env',
      'x-deno-pass': 'passthrough',
      'X-NF-Request-ID': 'foo',
    },
  })
  expect(response.status).toBe(200)

  const body = (await response.json()) as Record<string, string>
  expect(body.very_secret_secret).toBe('i love netlify')
})
