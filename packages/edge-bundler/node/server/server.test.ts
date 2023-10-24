import { readFile } from 'fs/promises'
import { join } from 'path'

import getPort from 'get-port'
import fetch from 'node-fetch'
import { v4 as uuidv4 } from 'uuid'
import { test, expect } from 'vitest'

import { fixturesDir } from '../../test/util.js'
import { serve } from '../index.js'

test('Starts a server and serves requests for edge functions', async () => {
  const basePath = join(fixturesDir, 'serve_test')
  const paths = {
    internal: join(basePath, '.netlify', 'edge-functions'),
    user: join(basePath, 'netlify', 'edge-functions'),
  }
  const port = await getPort()
  const importMapPaths = [join(paths.internal, 'import_map.json'), join(paths.user, 'import-map.json')]
  const servePath = join(basePath, '.netlify', 'edge-functions-serve')
  const server = await serve({
    basePath,
    bootstrapURL: 'https://edge.netlify.com/bootstrap/index-combined.ts',
    importMapPaths,
    port,
    servePath,
    featureFlags: {
      edge_functions_npm_modules: true,
    },
  })

  const functions = [
    {
      name: 'echo_env',
      path: join(paths.user, 'echo_env.ts'),
    },
    {
      name: 'greet',
      path: join(paths.internal, 'greet.ts'),
    },
    {
      name: 'global_netlify',
      path: join(paths.user, 'global_netlify.ts'),
    },
  ]
  const options = {
    getFunctionsConfig: true,
  }

  const { features, functionsConfig, graph, success, npmSpecifiersWithExtraneousFiles } = await server(
    functions,
    {
      very_secret_secret: 'i love netlify',
    },
    options,
  )
  expect(features).toEqual({ npmModules: true })
  expect(success).toBe(true)
  expect(functionsConfig).toEqual([{ path: '/my-function' }, {}, { path: '/global-netlify' }])
  expect(npmSpecifiersWithExtraneousFiles).toEqual(['dictionary'])

  for (const key in functions) {
    const graphEntry = graph?.modules.some(
      // @ts-expect-error TODO: Module graph is currently not typed
      ({ kind, mediaType, local }) => kind === 'esm' && mediaType === 'TypeScript' && local === functions[key].path,
    )

    expect(graphEntry).toBe(true)
  }

  const response1 = await fetch(`http://0.0.0.0:${port}/foo`, {
    headers: {
      'x-nf-edge-functions': 'echo_env',
      'x-ef-passthrough': 'passthrough',
      'X-NF-Request-ID': uuidv4(),
    },
  })
  expect(response1.status).toBe(200)
  expect(await response1.text()).toBe('I LOVE NETLIFY')

  const response2 = await fetch(`http://0.0.0.0:${port}/greet`, {
    headers: {
      'x-nf-edge-functions': 'greet',
      'x-ef-passthrough': 'passthrough',
      'X-NF-Request-ID': uuidv4(),
    },
  })
  expect(response2.status).toBe(200)
  expect(await response2.text()).toBe('HELLO!')

  const response3 = await fetch(`http://0.0.0.0:${port}/global-netlify`, {
    headers: {
      'x-nf-edge-functions': 'global_netlify',
      'x-ef-passthrough': 'passthrough',
      'X-NF-Request-ID': uuidv4(),
    },
  })
  expect(await response3.json()).toEqual({
    global: 'i love netlify',
    local: 'i love netlify',
  })

  const idBarrelFile = await readFile(join(servePath, 'bundled-id.js'), 'utf-8')
  expect(idBarrelFile).toContain(`/// <reference types="${join('..', '..', 'node_modules', 'id', 'types.d.ts')}" />`)

  const identidadeBarrelFile = await readFile(join(servePath, 'bundled-pt-committee__identidade.js'), 'utf-8')
  expect(identidadeBarrelFile).toContain(
    `/// <reference types="${join('..', '..', 'node_modules', '@types', 'pt-committee__identidade', 'index.d.ts')}" />`,
  )
})
