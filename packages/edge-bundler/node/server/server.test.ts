import { createWriteStream } from 'fs'
import { readFile } from 'fs/promises'
import { join } from 'path'
import process from 'process'

import { getURL as getBootstrapURL } from '@netlify/edge-functions-bootstrap/version'
import getPort from 'get-port'
import tmp from 'tmp-promise'
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
    bootstrapURL: await getBootstrapURL(),
    port,
    servePath,
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
    importMapPaths,
  }

  const { features, functionsConfig, graph, success } = await server(
    functions,
    {
      very_secret_secret: 'i love netlify',
    },
    options,
  )
  expect(features).toEqual({ npmModules: true })
  expect(success).toBe(true)
  expect(functionsConfig).toEqual([{ path: '/my-function' }, {}, { path: '/global-netlify' }])

  const modules = graph?.modules.filter(({ kind, mediaType }) => kind === 'esm' && mediaType === 'TypeScript')
  for (const key in functions) {
    const graphEntry = modules?.some(({ local }) => local === functions[key].path)

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

  const identidadeBarrelFile = await readFile(join(servePath, 'bundled-@pt-committee_identidade.js'), 'utf-8')
  expect(identidadeBarrelFile).toContain(
    `/// <reference types="${join('..', '..', 'node_modules', '@types', 'pt-committee__identidade', 'index.d.ts')}" />`,
  )
})

test('Serves edge functions in a monorepo setup', async () => {
  const tmpFile = await tmp.file()
  const stderr = createWriteStream(tmpFile.path)

  const rootPath = join(fixturesDir, 'monorepo_npm_module')
  const basePath = join(rootPath, 'packages', 'frontend')
  const paths = {
    user: join(basePath, 'functions'),
  }
  const port = await getPort()
  const importMapPaths = [join(basePath, 'import_map.json')]
  const servePath = join(basePath, '.netlify', 'edge-functions-serve')
  const server = await serve({
    basePath,
    bootstrapURL: await getBootstrapURL(),
    port,
    rootPath,
    servePath,
    stderr,
  })

  const functions = [
    {
      name: 'func1',
      path: join(paths.user, 'func1.ts'),
    },
  ]
  const options = {
    getFunctionsConfig: true,
    importMapPaths,
  }

  const { features, functionsConfig, graph, success } = await server(
    functions,
    {
      very_secret_secret: 'i love netlify',
    },
    options,
  )

  expect(features).toEqual({ npmModules: true })
  expect(success).toBe(true)
  expect(functionsConfig).toEqual([{ path: '/func1' }])

  for (const key in functions) {
    const graphEntry = graph?.modules.some(
      ({ kind, mediaType, local }) => kind === 'esm' && mediaType === 'TypeScript' && local === functions[key].path,
    )

    expect(graphEntry).toBe(true)
  }

  const response1 = await fetch(`http://0.0.0.0:${port}/func1`, {
    headers: {
      'x-nf-edge-functions': 'func1',
      'x-ef-passthrough': 'passthrough',
      'X-NF-Request-ID': uuidv4(),
    },
  })

  expect(response1.status).toBe(200)
  expect(await response1.text()).toBe(
    `<parent-1><child-1>JavaScript</child-1></parent-1>, <parent-2><child-2><grandchild-1>APIs<cwd>${process.cwd()}</cwd></grandchild-1></child-2></parent-2>, <parent-3><child-2><grandchild-1>Markup<cwd>${process.cwd()}</cwd></grandchild-1></child-2></parent-3>`,
  )

  expect(await readFile(tmpFile.path, 'utf8')).toContain('[func1] Something is on fire')

  await tmpFile.cleanup()
})
