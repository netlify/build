import { join } from 'path'
import { pathToFileURL } from 'url'

import getPort from 'get-port'
import fetch from 'node-fetch'
import { v4 as uuidv4 } from 'uuid'
import { test, expect } from 'vitest'

import { fixturesDir } from '../../test/util.js'
import { serve } from '../index.js'

test('Starts a server and serves requests for edge functions', async () => {
  const basePath = join(fixturesDir, 'serve_test')
  const functionPaths = {
    internal: join(basePath, '.netlify', 'edge-functions', 'greet.ts'),
    user: join(basePath, 'netlify', 'edge-functions', 'echo_env.ts'),
  }
  const port = await getPort()
  const internalImportMap = {
    baseURL: pathToFileURL(functionPaths.internal),
    imports: {
      'internal-helper': '../../helper.ts',
    },
  }
  const server = await serve({
    basePath,
    importMaps: [internalImportMap],
    port,
  })

  const functions = [
    {
      name: 'echo_env',
      path: functionPaths.user,
    },
    {
      name: 'greet',
      path: functionPaths.internal,
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
  expect(functionsConfig).toEqual([{ path: '/my-function' }, {}])

  for (const key in functionPaths) {
    const graphEntry = graph?.modules.some(
      // @ts-expect-error TODO: Module graph is currently not typed
      ({ kind, mediaType, local }) => kind === 'esm' && mediaType === 'TypeScript' && local === functionPaths[key],
    )

    expect(graphEntry).toBe(true)
  }

  const response1 = await fetch(`http://0.0.0.0:${port}/foo`, {
    headers: {
      'x-deno-functions': 'echo_env',
      'x-deno-pass': 'passthrough',
      'X-NF-Request-ID': uuidv4(),
    },
  })
  expect(response1.status).toBe(200)
  expect(await response1.text()).toBe('I LOVE NETLIFY')

  const response2 = await fetch(`http://0.0.0.0:${port}/greet`, {
    headers: {
      'x-deno-functions': 'greet',
      'x-deno-pass': 'passthrough',
      'X-NF-Request-ID': uuidv4(),
    },
  })
  expect(response2.status).toBe(200)
  expect(await response2.text()).toBe('HELLO!')
})
