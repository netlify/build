import { join } from 'path'

import getPort from 'get-port'
import fetch from 'node-fetch'
import { test, expect } from 'vitest'

import { fixturesDir } from '../../test/util.js'
import { serve } from '../index.js'

test('Starts a server and serves requests for edge functions', async () => {
  const port = await getPort()
  const server = await serve({
    port,
  })
  const functionPath = join(fixturesDir, 'serve_test', 'echo_env.ts')

  const functions = [
    {
      name: 'echo_env',
      path: functionPath,
    },
  ]
  const options = {
    getFunctionsConfig: true,
  }
  const { functionsConfig, graph, success } = await server(
    functions,
    {
      very_secret_secret: 'i love netlify',
    },
    options,
  )
  expect(success).toBe(true)

  expect(functionsConfig).toEqual([{ path: '/my-function' }])

  const graphEntry = graph?.modules.some(
    // @ts-expect-error TODO: Module graph is currently not typed
    ({ kind, mediaType, local }) => kind === 'esm' && mediaType === 'TypeScript' && local === functionPath,
  )
  expect(graphEntry).toBe(true)

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
